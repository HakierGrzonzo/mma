from datetime import datetime, timedelta
from unittest import TestCase

from src.api import Comic
from . import reduce_submissions_to_series

now = datetime.now()

five_seconds_ago = now - timedelta(seconds=5)
ten_seconds_ago = five_seconds_ago - timedelta(seconds=5)

a_little_hint = [
    Comic(
        title="A Little Hint of Blue -Chapter 1 Part 1",
        image_urls=[],
        upvotes=2137,
        uploaded_at=ten_seconds_ago,
        link="example.com",
        id="1",
    ),
    Comic(
        title="A Little Hint of Blue -Chapter 1 Part 2",
        image_urls=[],
        upvotes=3,
        uploaded_at=now,
        link="example.com",
        id="2",
    ),
]
random_comics = [
    Comic(
        title="foo",
        image_urls=[],
        upvotes=2,
        uploaded_at=ten_seconds_ago,
        link="example.com",
        id="3",
    ),
    Comic(
        title="foo",
        image_urls=[],
        upvotes=2,
        uploaded_at=five_seconds_ago,
        link="example.com",
        id="4",
    ),
]


class ReduceIntegrationTestCase(TestCase):
    def test_parses_series(self):
        result = reduce_submissions_to_series(c for c in a_little_hint)
        self.assertTrue(len(result) == 1)
        self.assertEqual(result[0].title, "A Little Hint of Blue")
        self.assertEqual(result[0].comics[0].id, a_little_hint[0].id)
        self.assertEqual(result[0].comics[1].id, a_little_hint[1].id)

    def test_parses_oneshots(self):
        result = reduce_submissions_to_series(c for c in random_comics)
        self.assertTrue(len(result) == 2)
        result = result[0]
        self.assertEqual(result.title, random_comics[0].title)
