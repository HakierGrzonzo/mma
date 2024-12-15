from praw import models
from logging import getLogger

logger = getLogger(__name__)


def is_image(path: str):
    return any(
        path.endswith(suffix) for suffix in ["jpeg", "jpg", "png", "webp", ".gif"]
    )


def get_gallery_links(submission: models.Submission):
    items = submission.gallery_data.get("items")
    for media_refrence in items:
        media = submission.media_metadata[media_refrence["media_id"]]
        metadata = media.get("s", {})
        if media.get("e") == "AnimatedImage":
            gif_url = metadata.get("gif")
            if gif_url is not None:
                yield gif_url
                continue
        biggest_picture: str = metadata.get("u")
        if biggest_picture is None:
            logger.warn(f"Failed to get one image from {submission.shortlink}")
            continue
        yield biggest_picture


def get_image_post_links(submission: models.Submission):
    image_url = submission.url
    if not is_image(image_url):
        logger.warn(f"{image_url} is not an image")
        return
    yield image_url


def get_image_urls(submission: models.Submission):
    if vars(submission).get("is_gallery"):
        urls = get_gallery_links(submission)
    else:
        urls = get_image_post_links(submission)
    return list(urls)
