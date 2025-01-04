from logging import getLogger

from praw.reddit import asyncio

from src.ocr import get_ocr_for_image
from .size import extract_image_size
from ..storage_service import storage
from ..schema.tables import Image
from src.api import http_client

logger = getLogger(__name__)

reddit_image_semaphore = asyncio.Semaphore(4)


async def download_image_from_url(url, file_path):
    logger.info(f"Downloading {file_path}")
    async with reddit_image_semaphore:
        result = await http_client.get(url, headers={"Accept": "image/webp;image/gif"})

    await storage.put_object_bytes(file_path, result.content)


textract_semaphore = asyncio.Semaphore(5)


async def handle_image(image: Image):
    was_image_downloaded = await image.is_downloaded()
    does_need_to_be_saved = False
    if not was_image_downloaded:
        image.file_path = await image.get_file_path()
        await download_image_from_url(image.link, image.file_path)
        does_need_to_be_saved = True
    if not image.is_measured():
        size = await extract_image_size(image.file_path)
        image.height = size["height"]
        image.width = size["width"]
        does_need_to_be_saved = True
    if not image.is_ocr():
        async with textract_semaphore:
            image.ocr = await get_ocr_for_image(image)
        does_need_to_be_saved = True
    if does_need_to_be_saved:
        await image.save()
    return image


async def download_images():
    images = await Image.objects()
    await asyncio.gather(*[handle_image(i) for i in images])
