import json
from logging import getLogger
from os import path

from praw.reddit import asyncio

from ..storage_service import storage

logger = getLogger(__name__)


async def migrate_one_series(series_folder: str):
    series_metadata_path = path.join(series_folder, "metadata.json")
    try:
        meta_file_content = await storage.get_object(series_metadata_path)
    except FileNotFoundError:
        logger.warn(f"Failed to fix {series_metadata_path}")
        return
    meta = json.loads(meta_file_content)
    for img_key, img_value in meta["images"].items():
        current_file_path: str = img_value["file_path"]
        if not current_file_path.startswith("./results/"):
            continue
        fixed_path = current_file_path.removeprefix("./results/")
        fixed_path = "./" + fixed_path
        meta["images"][img_key]["file_path"] = fixed_path

    new_meta_contents = json.dumps(meta)

    if new_meta_contents == meta_file_content:
        return

    logger.info(f"Fixing {series_metadata_path}")
    await storage.put_object(series_metadata_path, new_meta_contents)


async def migration():
    await asyncio.gather(
        *[migrate_one_series(folder) for folder in storage.list_objects_in_root()]
    )
