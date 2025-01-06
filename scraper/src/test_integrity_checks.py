from unittest import IsolatedAsyncioTestCase

from src.schema.tables import Comic


class IntegrityChecks(IsolatedAsyncioTestCase):
    async def test_no_links_are_blank(self):
        number_of_blank_links = await Comic.count().where(Comic.link == "")
        self.assertEqual(number_of_blank_links, 0)
