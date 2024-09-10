import asyncio
import json
from typing import List

from prompt_toolkit import PromptSession, patch_stdout

from src.tagger.series_session import SeriesSession

from .tag_sheet import TagSheet

from ..metadata import Metadata
from ..storage_service import storage


async def get_metas_without_tags():
    all_series = await storage.get_object("./index.json")
    all_series = json.loads(all_series)
    all_series = [Metadata.from_dict(v) for v in all_series.values()]
    series_without_tags = filter(lambda item: len(item.tags) == 0, all_series)
    sorted_series = sorted(
        series_without_tags, key=lambda item: item.series.latest_update(), reverse=True
    )
    return sorted_series


class TaggingSession:
    def __init__(self, tag_sheet: TagSheet, metas: List[Metadata]) -> None:
        self.tag_sheet = tag_sheet
        self.metas_to_tag = iter(metas)
        self.session = PromptSession()
        self.background_tasks: list[asyncio.Task] = []

    def run_in_background(self, coroutine):
        new_task = asyncio.create_task(coroutine)
        self.background_tasks.append(new_task)

    @classmethod
    async def start(cls):
        metas, tag_sheet = await asyncio.gather(
            get_metas_without_tags(), TagSheet.from_file_system()
        )
        return cls(tag_sheet, metas)

    async def tagging_loop(self):
        for meta in self.metas_to_tag:
            series_session = SeriesSession(meta, self)
            with patch_stdout.patch_stdout():
                await series_session.tag_series()
        await asyncio.gather(*self.background_tasks)
