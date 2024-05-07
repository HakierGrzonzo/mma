from src.reduce.series import get_possible_series
from ..api import Comic
from typing import Generator, List
from dataclasses import dataclass
from collections import defaultdict


@dataclass
class ComicSeries:
    title: str
    id: str
    comics: List[Comic]

    def latest_update(self):
        return self.comics[-1].uploaded_at


def reduce_submissions_to_series(comics: Generator[Comic, None, None]):
    series_titles = {}
    comics_dict = defaultdict(list)
    for comic in comics:
        series_title = get_possible_series(comic)
        if series_title is None:
            # Make up a series id
            series_title = comic.title
            series_id = f"{series_title}-{comic.id}"
        else:
            series_id = series_title

        comics_dict[series_id].append(comic)
        series_titles[series_id] = series_title

    comic_series = list(
        ComicSeries(title=series_titles[k], comics=v, id=k)
        for k, v in comics_dict.items()
    )
    comic_series.sort(key=lambda s: s.latest_update(), reverse=True)
    return comic_series
