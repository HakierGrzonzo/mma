from ..schema.tables import Tag
from logging import getLogger

from prompt_toolkit.completion import (
    CompleteEvent,
    Completer,
    Completion,
    FuzzyCompleter,
)
from prompt_toolkit.document import Document


logger = getLogger(__name__)


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
                    display_meta=tag.description,
                    start_position=-len(prefix),
                )


class TagSheet:
    def __init__(self) -> None:
        pass

    async def create(self, name: str) -> Tag:
        return await Tag.new(name)

    async def get(self, name_or_id: int | str):
        if isinstance(name_or_id, int):
            tag = await Tag.select().where(Tag.id == name_or_id).first()
        else:
            tag = await Tag.select().where(Tag.name == name_or_id).first()

        assert tag is not None
        return Tag(**tag)

    async def get_completer(self):
        tags = await Tag.select()
        return FuzzyCompleter(TagCompleter([Tag(**t) for t in tags]))

    async def get_all(self):
        tags = await Tag.select()
        return [Tag(**tag) for tag in tags]
