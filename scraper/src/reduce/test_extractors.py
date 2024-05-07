from unittest import TestCase
from parameterized import parameterized
from .extractors import (
    a_little_hint_of_blue_extractor,
    generic_extractor,
    hash_extractor,
)


class ExtractorsTestCase(TestCase):
    @parameterized.expand(
        [
            ("Enna (1/3)", "01"),
            ("Foovarius (9/?)", "09"),
            ("Falls back to hash #1", "01"),
        ]
    )
    def test_generic_extractor(self, title, expected):
        result = generic_extractor(title)
        self.assertEqual(result, expected)

    @parameterized.expand(
        [
            ("Falls back to hash #1", "01"),
            ("A little hint of blue #4", "04"),
        ]
    )
    def test_hash_extractor(self, title, expected):
        result = hash_extractor(title)
        self.assertEqual(result, expected)

    @parameterized.expand(
        [
            ("A little Hint of Blue -Chapter 8 Part 2", "8, 02"),
            ("A little hint of Blue #0", "00"),
        ]
    )
    def test_a_little_hint_of_blue(self, title, expected):
        result = a_little_hint_of_blue_extractor(title)
        self.assertEqual(result, expected)
