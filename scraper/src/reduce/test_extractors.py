from unittest import TestCase
from parameterized import parameterized
from .series import parser, transformer


class ExtractorsTestCase(TestCase):
    @parameterized.expand(
        [
            ("Enna (1/3)", "01"),
            ("Foovarius (9/?)", "09"),
            ("Falls back to hash #1", "01"),
            ("A little hint of blue #4", "04"),
            ("A little Hint of Blue -Chapter 8 Part 2", "8, 02"),
            ("A little hint of Blue #0", "00"),
            ("Random #0 text after that number in finale", "00"),
        ]
    )
    def test_generic_extractor(self, title, expected):
        parsed = parser.parse(title)
        _, extracted = transformer.transform(parsed)
        self.assertEqual(extracted, expected)
