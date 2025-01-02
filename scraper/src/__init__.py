import logging

from src.api import get_comics
from src.images import download_images
from src.reduce import reduce_submissions_to_series
from src.schema.tables import Comic

logging.basicConfig(format="%(levelname)s:%(name)s:\t%(message)s")
logging.getLogger().setLevel(logging.INFO)


async def main():
    async with Comic._meta.db.transaction():
        comics = get_comics()
        await reduce_submissions_to_series(comics)
        await download_images()
