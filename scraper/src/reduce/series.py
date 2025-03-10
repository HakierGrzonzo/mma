from praw.models import Submission
from pathlib import Path
from lark import Lark, ParseError, Transformer, Tree

path = Path(__file__).parent
raw_grammar = open(path / "title.lark")
parser = Lark(raw_grammar)


class ComicTitleTransformer(Transformer):
    evil_luz = lambda _1, _2: "Evil Luz"  # noqa: E731
    luzifer_au = lambda _1, _2: "Luzifer AU"  # noqa: E731
    actor_au = lambda _1, _2: "Actor AU"  # noqa: E731

    def multiple_words(self, items):
        return " ".join(items)

    def word(self, items):
        return "".join(items)

    def start(self, items):
        title, marker = items[0]
        return title, marker

    def conventional_series(self, items):
        title, marker = items[:2]
        return title, marker

    def prefix_series(self, items: tuple[Tree, Tree]):
        series_prefix, episode_name = items
        return series_prefix, episode_name

    def hash_marker(self, items):
        return items[0].zfill(2)

    def out_of_marker(self, items):
        return items[0].zfill(2)

    def a_little_hint_of_blue_marker(self, items):
        chapter, part = items
        return f"{chapter}, {part.zfill(2)}"


transformer = ComicTitleTransformer()


def get_possible_series(comic: Submission) -> tuple[str, str] | None:
    edge_case_comics = [
        "16cgmg1",  # First part of Grom Factor lacks the series indicator
        "18ofkcf",  # First part of Mama Eda also lacks it
    ]
    if comic.id in edge_case_comics:
        return comic.title, "01"
    # Some initial Evil Luz comics are not formatted as a series at all
    if comic.id == "1f8u244":
        return "Evil Luz", "Evil Luz vs. Emperor Belos"
    if comic.id == "1f4vz4t":
        return "Evil Luz", "Evil Luz AU"
    try:
        parsed = parser.parse(comic.title.strip())
        series_title, comic_part = transformer.transform(parsed)
        if series_title == "Hexsquad":
            # MM forgot the `the`?
            return "The Hexsquad", comic_part
        return series_title, comic_part
    except ParseError as e:
        e.add_note(comic.title)
        return None
