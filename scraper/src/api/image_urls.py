from praw import models
from logging import getLogger

logger = getLogger(__name__)


def is_image(path: str):
    return any(path.endswith(suffix) for suffix in ["jpeg", "jpg", "png", "webp"])


def get_gallery_links(submission: models.Submission):
    items = submission.gallery_data.get("items")
    for media_refrence in items:
        media = submission.media_metadata[media_refrence["media_id"]]
        biggest_picture: str = media.get("s").get("u")
        if biggest_picture is None:
            logger.warn("Failed to get one image")
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
