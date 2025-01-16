import asyncio
from typing import TypedDict

from prompt_toolkit import PromptSession, patch_stdout

from src.schema.tables import ComicSeries
from src.tagger.series_session import SeriesSession

from .tag_sheet import TagSheet


class SubjectInfo(TypedDict):
    title: str
    id: str
    number_of_images: int


class TaggingSession:
    def __init__(self) -> None:
        self.tag_sheet = TagSheet()
        self.session = PromptSession()
        self.background_tasks: list[asyncio.Task] = []

    def run_in_background(self, coroutine):
        new_task = asyncio.create_task(coroutine)
        self.background_tasks.append(new_task)

    async def download_images(self, series_sessions: list[SeriesSession]):
        for session in series_sessions:
            await session.download_images()

    async def tagging_loop(self):
        series_to_tag: list[SubjectInfo] = await ComicSeries.raw(
            """
        SELECT 
            comic_series.title,
            comic_series.id,
            COUNT(image.link) as number_of_images
        FROM comic_series
            LEFT JOIN comic_series_tag
                ON comic_series_tag.comic_series = comic_series.id
            JOIN comic 
                ON comic.series = comic_series.id
            JOIN image 
                ON image.comic = comic.id
        GROUP BY 
            comic_series.id
        HAVING 
            COUNT(comic_series_tag.id) = 0
        """
        )
        if len(series_to_tag) == 0:
            print("No series to tag!")
            return
        series = [SeriesSession(s, self) for s in series_to_tag]
        self.run_in_background(self.download_images(series))
        with patch_stdout.patch_stdout(True):
            for i, series in enumerate(series):
                print(f"({i+1}/{len(series_to_tag)})")
                try:
                    await series.tag_series()
                except EOFError:
                    break
        await asyncio.gather(*self.background_tasks)
