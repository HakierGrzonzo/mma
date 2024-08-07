from collections import defaultdict
from typing import List, Tuple

from ..api import Comic
from .extractors import (
    hash_extractor,
    a_little_hint_of_blue_extractor,
    generic_extractor,
)

series: List[Tuple[str, List[str]]] = [
    ("A Little Hint of Blue", []),
    ("Boscha", []),
    ("Enna", []),
    ("Fight Coven", []),
    ("Grom Factor", []),
    ("Grom", []),
    ("Mama Eda", ["yd5jpn"]),
    ("Milan", []),
    ("Pandora", []),
    ("The Hexsquad", []),
]

_series_name_to_extractor = {
    "Grom Factor": hash_extractor,
    "The Hexsquad": hash_extractor,
    "A Little Hint of Blue": a_little_hint_of_blue_extractor,
}

series_name_to_extractor = defaultdict(
    lambda: generic_extractor, _series_name_to_extractor
)


def get_possible_series(comic: Comic) -> str | None:
    for series_title, banned_ids in series:
        if comic.id in banned_ids:
            continue
        if comic.title.startswith(series_title):
            return series_title

    return None
