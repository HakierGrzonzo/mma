import logging
from src.api import get_comics
from src.images import download_images
from src.metadata import load_metadata_from_filesystem, save_metadata
from src.reduce import reduce_submissions_to_series

logging.basicConfig(format="'%(levelname)s:%(name)s:\t%(message)s'")
logging.getLogger().setLevel(logging.INFO)


def main():
    comics = get_comics()
    series = reduce_submissions_to_series(comics)
    metas = load_metadata_from_filesystem(series)
    download_images(metas)
    save_metadata(metas)
