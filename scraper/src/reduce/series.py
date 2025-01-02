from praw.models import Submission
from pathlib import Path
from lark import Lark, ParseError, Transformer

path = Path(__file__).parent
raw_grammar = open(path / "title.lark")
parser = Lark(raw_grammar)


class ComicTitleTransformer(Transformer):
    def multiple_words(self, items):
        return " ".join(items)

    def word(self, items):
        return "".join(items)

    def start(self, items):
        title, marker = items[:2]
        return title, marker

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
    try:
        parsed = parser.parse(comic.title.strip())
        series_title, comic_part = transformer.transform(parsed)
        if series_title == "Hexsquad":
            # MM forgot the `the`?
            return "The Hexsquad", comic_part
        return series_title, comic_part
    except ParseError:
        return None
