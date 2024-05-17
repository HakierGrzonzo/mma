from logging import getLogger
from os import path
from typing import List

from praw.reddit import asyncio

from src.ocr import get_ocr_for_image
from .size import extract_image_size

from src.api import session

from src.metadata import Metadata

logger = getLogger(__name__)

reddit_image_lock = asyncio.Lock()


async def download_image_from_url(url, file_path):
    logger.info(f"Downloading {file_path}")
    async with reddit_image_lock:
        result = await asyncio.to_thread(
            session.get, url, headers={"Accept": "image/webp"}
        )
    with open(file_path, "wb+") as out_file:
        out_file.write(result.content)


textract_semaphore = asyncio.Semaphore(5)


async def download_from_series(meta: Metadata):
    comics = meta.series.comics
    for comic in comics:
        image_urls = comic.image_urls
        for j, url in enumerate(image_urls):
            if comic.prefix is not None:
                file_path = f"{comic.prefix}-{j}.webp"
            else:
                file_path = f"{j}.webp"
            meta.images[url].file_path = path.join(
                meta.get_filepath_prefix(), file_path
            )

    for url, image in meta.images.items():
        if not image.is_downloaded():
            await download_image_from_url(url, image.file_path)
        if not image.is_measured():
            size = extract_image_size(image.file_path)
            image.height = size["height"]
            image.width = size["width"]
        if not image.is_ocr():
            async with textract_semaphore:
                image.ocr = await asyncio.to_thread(get_ocr_for_image, image)


async def download_images(metas: List[Metadata]):
    await asyncio.gather(*[download_from_series(meta) for meta in metas])
