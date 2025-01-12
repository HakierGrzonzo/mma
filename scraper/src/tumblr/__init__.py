from datetime import datetime, timedelta, UTC
from logging import getLogger
from .api import TumblrApi
from sqlite3 import IntegrityError
from .npf_image_extractor import extract_image_urls
from ..schema.tables import Comic, ComicSeries, Image

logger = getLogger(__name__)

tumblr_api = TumblrApi()


async def try_correlate_alternative_timelines(series: ComicSeries):
    select_comic_upload_times = (
        await Comic.select(Comic.uploaded_at, Comic.id, Comic.title)
        .where(Comic.series == series.id)
        .order_by(Comic.uploaded_at, ascending=False)
    )
    posts_to_process = tumblr_api.get_posts()
    post_to_alt = {}
    for comic in select_comic_upload_times:
        uploaded_at = comic["uploaded_at"]
        if uploaded_at < datetime(2024, 11, 28, tzinfo=UTC):
            break
        while True:
            tumblr_post = await anext(posts_to_process)
            tumblr_posted_at = datetime.fromtimestamp(tumblr_post["timestamp"])
            tumblr_posted_at = tumblr_posted_at.replace(tzinfo=UTC)
            post_time_delta: timedelta = tumblr_posted_at - uploaded_at
            if post_time_delta < timedelta(hours=2):
                logger.info(
                    f"{tumblr_post['post_url']} might be a link for {comic['title']}"
                )
                post_to_alt[comic["id"]] = tumblr_post.copy()
                break
            if post_time_delta < timedelta(hours=-1):
                break

    alt_series = ComicSeries(
        {
            ComicSeries.title: "Luzifer AU - tumblr timeline",
            ComicSeries.id: "Luzifer AU tumblr",
        }
    )
    try:
        await alt_series.save()
    except IntegrityError:
        logger.warn("Series already created")
        alt_series = (
            await ComicSeries.objects().where(ComicSeries.id == alt_series.id).first()
        )
        pass
    for comic_id, tumblr_post in post_to_alt.items():
        base_comic = await Comic.objects().where(Comic.id == comic_id).first()
        assert base_comic is not None
        new_comic = Comic(
            {
                Comic.id: base_comic.id + "alt",
                Comic.title: f"{base_comic.title.strip()} - Alternative Timeline",
                Comic.upvotes: tumblr_post["note_count"],
                Comic.link: tumblr_post["short_url"],
                Comic.uploaded_at: base_comic.uploaded_at,
                Comic.series: alt_series.id,
                Comic.prefix: tumblr_post["id"],
            }
        )
        try:
            await new_comic.save()
        except IntegrityError as e:
            print(e)
            logger.warn(f"Comic {base_comic.title} already created")

        images = extract_image_urls(tumblr_post["body"])
        for i, image_url in enumerate(images):
            image = Image(
                {
                    Image.link: image_url,
                    Image.order: i,
                    Image.comic: new_comic.id,
                }
            )
            try:
                await image.save()
            except IntegrityError:
                logger.warn("Image already added")
