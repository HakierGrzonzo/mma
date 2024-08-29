import unittest

from parameterized import parameterized

from .series import get_possible_series


class ComicLike:
    def __init__(self, title, comic_id=None) -> None:
        self.title = title
        self.id = comic_id


class SeriesRecognitionTestCase(unittest.TestCase):
    @parameterized.expand(
        [
            "Titan’s Revelation",
            "The Awesome adventures of foovarius",
            "Interdimensional Family Dinner  ",
            " Mother of Titan",
        ]
    )
    def test_skips_non_series(self, input):
        result = get_possible_series(ComicLike(input))
        self.assertIsNone(result)

    def test_handles_grom_factors_first_part(self):
        result = get_possible_series(ComicLike("Grom Factor", "16cgmg1"))
        self.assertIsNotNone(result)
        title, part = result
        self.assertEqual(title, "Grom Factor")
        self.assertEqual(part, "01")

    def test_handles_mama_eda_first_part(self):
        result = get_possible_series(ComicLike("Mama Eda", "18ofkcf"))
        self.assertIsNotNone(result)
        title, part = result
        self.assertEqual(title, "Mama Eda")
        self.assertEqual(part, "01")

    def test_handles_mama_eda_but_not_the_unrelated_one(self):
        result = get_possible_series(ComicLike("Mama Eda", "yd5jpn"))
        self.assertIsNone(result)

    def test_handles_missing_the_in_hexsquad(self):
        title, _ = get_possible_series(ComicLike("Hexsquad #2137", "yd5jpn"))
        self.assertEqual(title, "The Hexsquad")
