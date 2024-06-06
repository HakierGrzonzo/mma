import logging

from src.api import get_comics
from src.images import download_images
from src.metadata import (
    load_metadata_from_filesystem,
    save_index_metadata,
    save_metadata,
)
from src.reduce import reduce_submissions_to_series

logging.basicConfig(format="%(levelname)s:%(name)s:\t%(message)s")
logging.getLogger().setLevel(logging.INFO)


async def main():
    comics = get_comics()
    series = reduce_submissions_to_series(comics)
    metas = load_metadata_from_filesystem(series)
    metas = download_images(metas)
    all_metadatas = [m async for m in save_metadata(metas)]
    await save_index_metadata(all_metadatas)
