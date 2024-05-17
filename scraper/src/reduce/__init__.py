from src.reduce.series import get_possible_series
from ..api import Comic
from .series import series_name_to_extractor
from typing import Generator, List
from dataclasses import asdict, dataclass
from collections import defaultdict
from string import ascii_letters, digits


class ComicWithPrefix(Comic):
    prefix: str | None = None


@dataclass
class ComicSeries:
    title: str
    id: str
    comics: List[ComicWithPrefix]

    def latest_update(self):
        return self.comics[-1].uploaded_at


def reduce_submissions_to_series(comics: Generator[ComicWithPrefix, None, None]):
    series_titles = {}
    comics_dict = defaultdict(list)
    for comic in comics:
        series_title = get_possible_series(comic)
        comic = ComicWithPrefix(**asdict(comic))
        if series_title is None:
            # Make up a series id
            comic_title = "".join(
                filter(lambda char: char in ascii_letters + digits + " ", comic.title)
            )
            series_title = comic.title
            series_id = f"{comic_title}-{comic.id}"
        else:
            series_id = series_title
            comic.prefix = series_name_to_extractor[series_title](comic.title)

        comics_dict[series_id].append(comic)
        series_titles[series_id] = series_title

    comic_series = list(
        ComicSeries(title=series_titles[k], comics=v, id=k)
        for k, v in comics_dict.items()
    )
    comic_series.sort(key=lambda s: s.latest_update(), reverse=True)
    return comic_series
