from dataclasses import asdict
import logging
from string import ascii_letters, digits

from src.api import Comic, get_comics, reddit
from src.async_buffered_map import AsyncBufferedMap
from src.images import download_from_series, download_images
from src.metadata import (
    Metadata,
    load_metadata_from_filesystem,
    save_index_metadata,
)
from src.reduce import ComicSeries, ComicWithPrefix, reduce_submissions_to_series

logging.basicConfig(format="%(levelname)s:%(name)s:\t%(message)s")
logging.getLogger().setLevel(logging.INFO)


async def refresh_single_comic(post_id: str):
    reddit_post = reddit.submission(post_id)
    comic = Comic.from_submission(reddit_post)
    assert comic.is_valid()
    comic = ComicWithPrefix(**asdict(comic))
    comic_title = "".join(
        filter(
            lambda char: char in ascii_letters + digits + " ",
            comic.title,
        )
    )
    series_title = comic.title
    series_id = f"{comic_title}-{comic.id}"
    series = ComicSeries(title=series_title, comics=[comic], id=series_id)
    meta = await Metadata.from_series(series)
    meta = await download_from_series(meta)
    await meta.save()


async def main():
    comics = get_comics()
    series = reduce_submissions_to_series(comics)
    metas = load_metadata_from_filesystem(series)
    metas = download_images(metas)
    await AsyncBufferedMap(lambda m: m.save(), metas).do_all()
    await save_index_metadata()
