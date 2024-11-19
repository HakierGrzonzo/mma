from unittest import TestCase
from parameterized import parameterized
from .corrections import correct_casing


class CorrectionsTestCase(TestCase):
    @parameterized.expand(
        [
            ("i am not as cool as you think", "I am not as cool as you think"),
            ("who are you? no one!", "Who are you? No one!"),
            (
                "well, i don't wanna start drama.",
                "Well, I don't wanna start drama.",
            ),
        ]
    )
    def test_corrects(self, original, expected):
        result = correct_casing(original)
        self.assertEqual(result, expected)
