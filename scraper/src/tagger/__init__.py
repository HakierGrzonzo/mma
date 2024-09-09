from dataclasses import dataclass
from datetime import datetime
import json
from logging import getLogger
from typing import Iterable
from prompt_toolkit.completion import Completer, Completion, NestedCompleter
from prompt_toolkit.document import Document
from prompt_toolkit.patch_stdout import patch_stdout
from prompt_toolkit import HTML, PromptSession, print_formatted_text

from praw.reddit import asyncio

from ..metadata import Metadata
from ..storage_service import storage

logger = getLogger(__name__)


@dataclass
class Tag:
    name: str
    id: int


async def get_tag_sheet():
    try:
        raw_sheet = await storage.get_object("./tags.json")
    except:
        logger.warn("No tag sheet found, going with empty tag sheet")
        return {}
    json_sheet = json.loads(raw_sheet)
    tags = [Tag(**v) for v in json_sheet]
    return {t.id: t for t in tags}


async def get_metas_without_tags():
    all_series = await storage.get_object("./index.json")
    all_series = json.loads(all_series)
    all_series = [Metadata.from_dict(v) for v in all_series.values()]
    series_without_tags = filter(lambda item: len(item.tags) == 0, all_series)
    sorted_series = sorted(
        series_without_tags, key=lambda item: item.series.latest_update(), reverse=True
    )
    return sorted_series


class TagCompleter(Completer):
    def __init__(self, tag_map: dict[int, Tag]) -> None:
        self._tag_map = tag_map

    def get_completions(self, document: Document, _) -> Iterable[Completion]:
        prefix = document.text_before_cursor
        for tag in self._tag_map.values():
            if tag.name.startswith(prefix):
                yield Completion(
                    text=tag.name,
                    display_meta=f"id: {tag.id}",
                    start_position=-len(prefix),
                )


def add_tag(tag_map: dict[int, Tag], tag_name):
    tag_id = int(datetime.now().timestamp())
    tag_map[tag_id] = Tag(tag_name, tag_id)


async def tag_series(meta: Metadata, session: PromptSession, tag_map: dict[int, Tag]):
    completer = NestedCompleter.from_nested_dict(
        {"tag": TagCompleter(tag_map), "new": None, "next": None, "view": None}
    )
    print_formatted_text(HTML(f"<b>{meta.series.title}</b>"))
    series_readable_tags = [tag_map[t].name for t in meta.tags]
    print_formatted_text(HTML(f"<i>Tags:</i> {', '.join(series_readable_tags)}"))
    command: str = await session.prompt_async("$ ", completer=completer)
    first_cmd, args = command.split(" ", 1)
    handlers = {
        "new": lambda: add_tag(tag_map, args),
    }
    handlers[first_cmd]()


async def tag_loop():
    series_without_tags, tag_map = await asyncio.gather(
        get_metas_without_tags(), get_tag_sheet()
    )
    session = PromptSession()
    with patch_stdout():
        for meta in series_without_tags:
            await tag_series(meta, session, tag_map)
