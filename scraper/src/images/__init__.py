from logging import getLogger

from praw.reddit import asyncio

from src.ocr import get_ocr_for_image
from .size import extract_image_size
from ..storage_service import storage
from ..schema.tables import ComicSeries, Image
from src.api import http_client

logger = getLogger(__name__)

reddit_image_semaphore = asyncio.Semaphore(4)


async def download_image_from_url(url, file_path):
    logger.info(f"Downloading {file_path}")
    async with reddit_image_semaphore:
        result = await http_client.get(url, headers={"Accept": "image/webp;image/gif"})

    await storage.put_object_bytes(file_path, result.content)


textract_semaphore = asyncio.Semaphore(5)


async def handle_image(url, image: Image):
    was_image_downloaded = await image.is_downloaded()
    if not was_image_downloaded:
        await download_image_from_url(url, image.file_path)
    if not image.is_measured():
        size = await extract_image_size(image.file_path)
        image.height = size["height"]
        image.width = size["width"]
    if not image.is_ocr():
        async with textract_semaphore:
            image.ocr = await get_ocr_for_image(image)


async def download_from_series(series: ComicSeries):
    """
    comics = meta.series.comics
    for comic in comics:
        image_urls = comic.image_urls
        for j, url in enumerate(image_urls):
            file_extension = "gif" if url.endswith(".gif") else "webp"
            if comic.prefix is not None:
                file_path = f"{comic.prefix}-{j}.{file_extension}"
            else:
                file_path = f"{j}.{file_extension}"
            meta.images[url].file_path = path.join(
                meta.get_filepath_prefix(), file_path
            )
    await asyncio.gather(
        *[handle_image(url, image) for url, image in meta.images.items()]
    )

    return meta
    """


def download_images():
    pass
