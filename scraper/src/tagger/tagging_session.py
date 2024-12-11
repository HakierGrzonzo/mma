import asyncio
from itertools import pairwise
import json
from typing import List, TypedDict

from piccolo.query import WhereRaw
from prompt_toolkit import PromptSession, patch_stdout

from src.schema.tables import ComicSeries
from src.tagger.series_session import SeriesSession

from .tag_sheet import TagSheet

from ..metadata import Metadata

class SubjectInfo(TypedDict):
    title: str
    id: str
    number_of_images: int

class TaggingSession:
    def __init__(self, metas: List[Metadata]) -> None:
        self.tag_sheet = TagSheet()
        self.metas_to_tag = metas
        self.session = PromptSession()
        self.background_tasks: list[asyncio.Task] = []

    def run_in_background(self, coroutine):
        new_task = asyncio.create_task(coroutine)
        self.background_tasks.append(new_task)

    async def tagging_loop(self):
        series_to_tag: list[SubjectInfo] = await ComicSeries.raw(
        """
        SELECT 
            comic_series.title,
            comic_series.id,
            COUNT(image.link) as number_of_images
        FROM comic_series
            JOIN comic_series_tag
                ON comic_series_tag.comic_series = comic_series.id
            JOIN comic 
                ON comic.series = comic_series.id
            JOIN image 
                ON image.comic = comic.id
        GROUP BY 
            comic_series.id
        HAVING 
            COUNT(comic_series_tag.id) = 0
        """)
        with patch_stdout.patch_stdout(True):
            sessions_with_numbers = [
                (i, SeriesSession(meta, self)) for i, meta in enumerate(series_to_tag)
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
        await asyncio.gather(*self.background_tasks)
