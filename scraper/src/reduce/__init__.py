from datetime import datetime
from logging import getLogger
from typing import Iterable
from praw.models import Submission

from src.api.image_urls import get_image_urls
from .series import get_possible_series
from ..schema.tables import Comic, ComicSeries, Image
from collections import defaultdict
from string import ascii_letters, digits

logger = getLogger(__name__)


async def handle_orphan_series(series_id: str):
    number_of_comics = await Comic.count().where(Comic.series == series_id)
    if number_of_comics == 0:
        logger.warning(f"Series {series_id} is an orphan, deleting")
        await ComicSeries.delete().where(ComicSeries.id == series_id)


def clean_title(raw: str):
    return raw.replace("[MoringMark]", "").strip()


async def update_comic(series_id: str, comic: Submission, prefixes: dict[str, str]):
    existing_comic = await Comic.select().where(Comic.id == comic.id).first()
    if existing_comic:
        if series_id != (old_series_id := existing_comic["series"]):
            logger.warning(
                f"Inconsistent series in {existing_comic['title']}, swapping to {series_id}"
            )
            await Comic.update({Comic.series: series_id}).where(Comic.id == comic.id)
            await handle_orphan_series(old_series_id)

        return (
            await Comic.update({Comic.upvotes: comic.score})
            .where(Comic.id == comic.id)
            .returning(*Comic.all_columns())
        )
    date = datetime.fromtimestamp(comic.created)
    new_comic = Comic(
        id=comic.id,
        title=clean_title(comic.title),
        upvotes=comic.score,
        link=comic.shortlink,
        uploaded_at=date,
        series=series_id,
        prefix=prefixes[comic.id],
    )
    await Comic.insert(new_comic)

    image_insert = Image.insert()
    for i, image_url in enumerate(get_image_urls(comic)):
        new_image = Image(
            link=image_url,
            order=i,
            comic=comic.id,
            ocr=None,
            height=None,
            width=None,
            file_path=None,
        )
        image_insert.add(new_image)
    await image_insert


async def update_existing_series(
    series: ComicSeries, comics: list[Submission], prefixes: dict[str, str]
):
    for comic in comics:
        await update_comic(series.id, comic, prefixes)


async def reduce_submissions_to_series(
    submissions: Iterable[Submission],
):
    series_titles = {}
    series_prefixes = defaultdict(lambda: "")
    comics_dict: defaultdict[str, list[Submission]] = defaultdict(list)
    for submission in submissions:
        series = get_possible_series(submission)
        if series is None:
            # Make up a series id
            sanitized_comic_title = "".join(
                filter(
                    lambda char: char in ascii_letters + digits + " ",
                    submission.title,
                )
            )
            series_title = submission.title
            series_id = f"{sanitized_comic_title}-{submission.id}"
        else:
            series_title, series_prefix = series
            series_prefixes[submission.id] = series_prefix
            series_id = series_title

        comics_dict[series_id].append(submission)
        series_titles[series_id] = series_title

    for series_id, comics in comics_dict.items():
        existing_series = (
            await ComicSeries.select().where(ComicSeries.id == series_id).first()
        )
        if existing_series:
            await update_existing_series(
                ComicSeries(**existing_series), comics, series_prefixes
            )
            continue

        comic_series = ComicSeries(
            id=series_id,
            title=clean_title(series_titles[series_id]),
        )
        await comic_series.save()
        for comic in comics:
            await update_comic(series_id, comic, series_prefixes)
