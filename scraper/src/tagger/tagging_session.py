import asyncio
from itertools import pairwise
import json
from typing import List

from prompt_toolkit import PromptSession, patch_stdout

from src.tagger.series_session import SeriesSession

from .tag_sheet import TagSheet

from ..metadata import Metadata, save_index_metadata
from ..storage_service import storage


async def get_metas():
    all_series = await storage.get_object("index.json")
    all_series = json.loads(all_series)
    all_series = [Metadata.from_dict(v) for v in all_series.values()]
    sorted_series = sorted(
        all_series, key=lambda item: item.series.latest_update(), reverse=True
    )
    return sorted_series


class TaggingSession:
    def __init__(self, tag_sheet: TagSheet, metas: List[Metadata]) -> None:
        self.tag_sheet = tag_sheet
        self.metas_to_tag = metas
        self.session = PromptSession()
        self.background_tasks: list[asyncio.Task] = []

    def run_in_background(self, coroutine):
        new_task = asyncio.create_task(coroutine)
        self.background_tasks.append(new_task)

    @classmethod
    async def start(cls):
        metas, tag_sheet = await asyncio.gather(
            get_metas(), TagSheet.from_file_system()
        )
        return cls(tag_sheet, metas)

    def should_prompt_about_comic(self, meta: Metadata):
        return len(meta.tags) == 0

    async def tagging_loop(self):
        with patch_stdout.patch_stdout(True):
            metas_with_numbers = filter(
                lambda pair: self.should_prompt_about_comic(pair[1]),
                enumerate(self.metas_to_tag),
            )
            sessions_with_numbers = [
                (i, SeriesSession(meta, self)) for i, meta in metas_with_numbers
            ]
            sessions_with_numbers[0][1].start_downloading_images()
            for (i, series_session), (_, next_session) in pairwise(
                sessions_with_numbers
            ):
                print(f"({i+1}/{len(self.metas_to_tag)})")
                next_session.start_downloading_images()
                try:
                    await series_session.tag_series()
                except EOFError:
                    break
        await asyncio.gather(*self.background_tasks, save_index_metadata())
