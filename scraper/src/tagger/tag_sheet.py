from dataclasses import asdict, dataclass
from datetime import datetime
import json
from logging import getLogger
from typing import Iterable, Self

from prompt_toolkit.completion import (
    CompleteEvent,
    Completer,
    Completion,
    FuzzyCompleter,
)
from prompt_toolkit.document import Document

from ..storage_service import storage

logger = getLogger(__name__)


@dataclass
class Tag:
    name: str
    id: int

    @classmethod
    def new(cls, name: str):
        now = datetime.now().timestamp()
        id = int(now)
        return cls(name=name, id=id)

    def __str__(self) -> str:
        return f"<Tag name={self.name} id={self.id}>"


class TagCompleter(Completer):
    def __init__(self, tags: list[Tag]) -> None:
        self.tags = tags

    def get_completions(self, document: Document, complete_event: CompleteEvent):
        prefix = document.text_before_cursor
        if "," in prefix:
            prefix = prefix[prefix.rindex(",") + 1 :]
        prefix = prefix.strip()
        for tag in self.tags:
            if tag.name.startswith(prefix):
                yield Completion(
                    text=f"{tag.name}, ",
                    display=tag.name,
                    display_meta=f"id: {tag.id}",
                    start_position=-len(prefix),
                )


class TagSheet:
    def __init__(self, tags: list[Tag]) -> None:
        self._tags_for_id = {t.id: t for t in tags}
        self._tags_for_name = {t.name: t for t in tags}
        self._tags = tags

    @classmethod
    async def from_file_system(cls) -> Self:
        try:
            raw_sheet = await storage.get_object("tags.json")
        except FileNotFoundError:
            logger.warn("No tag sheet found, going with empty tag sheet")
            return cls([])
        json_sheet = json.loads(raw_sheet)
        tags = [Tag(**v) for v in json_sheet]
        return cls(tags)

    async def save(self):
        serialized = json.dumps([asdict(t) for t in self._tags], indent=4)
        await storage.put_object("tags.json", serialized)

    def create(self, name: str) -> Tag:
        all_tag_names = self._tags_for_name.keys()
        assert name not in all_tag_names
        new_tag = Tag.new(name)
        self._tags_for_name[new_tag.name] = new_tag
        self._tags_for_id[new_tag.id] = new_tag
        self._tags.append(new_tag)

        return new_tag

    def get(self, name_or_id: int | str):
        if isinstance(name_or_id, int):
            return self._tags_for_id[name_or_id]
        return self._tags_for_name[name_or_id]

    def get_completer(self):
        return FuzzyCompleter(TagCompleter(self._tags))

    def resolve_ids_to_names(self, ids: Iterable[int]):
        for id in ids:
            yield self._tags_for_id[id].name
