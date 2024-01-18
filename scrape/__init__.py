from time import time
from scrape.series import SeriesSavers, get_possible_series
from .reddit import get_new_comics


def scrape():
    series_savers = SeriesSavers()
    for submission in get_new_comics():
        saver = series_savers[
            get_possible_series(submission)
            or f"{submission.title}-{submission.id}"
        ]
        saver.download(submission)

    for series in series_savers.values():
        series.close()


def process_image(series):
    start_time = time()
    print(f"Processing {series.name}")
    series.extract_content_text()
    end_time = time()
    print(f"Finished {series.name} in {end_time - start_time}s")


def index():
    series_savers = SeriesSavers().populate_from_dir()
    nubmer_of_series = len(series_savers.values())
    for i, series in enumerate(series_savers.values()):
        print(f"{i}/{nubmer_of_series}")
        process_image(series)
