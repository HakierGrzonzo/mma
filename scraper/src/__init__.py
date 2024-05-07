import logging
from src.api import get_comics
from src.metadata import load_metadata_from_filesystem, save_metadata
from src.reduce import reduce_submissions_to_series

logging.basicConfig()
logging.getLogger().setLevel(logging.INFO)


def main():
    comics = get_comics()
    series = reduce_submissions_to_series(comics)
    meteas = load_metadata_from_filesystem(series)
    save_metadata(meteas)
