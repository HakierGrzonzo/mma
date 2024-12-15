from logging import getLogger
from typing import Generator
import praw
from praw import models
import httpx
from os import environ


from .filters import is_submission_valid


USER_AGENT = "MoringMarkArchiver (by u/hakiergrzonzo)"
COMIC_LIMIT = int(environ.get("COMIC_LIMIT", 0))

logger = getLogger(__name__)

secret = environ.get("SECRET")
if secret is None:
    logger.error("No SECRET env specified!")
    secret = "foo"

http_client = httpx.AsyncClient(headers={"User-Agent": USER_AGENT})

reddit = praw.Reddit(
    user_agent=USER_AGENT,
    client_id="xd-riCdiH0xPRTRFIglbCQ",
    client_secret=secret,
)


def get_moring_mark() -> models.Redditor:
    return reddit.redditor("makmark")


def get_new_comics() -> Generator[models.Submission, None, None]:
    mark_mark = get_moring_mark()
    for i, submission in enumerate(mark_mark.submissions.new(limit=None)):
        if i > COMIC_LIMIT and COMIC_LIMIT != 0:
            break
        if submission.subreddit.display_name != "TheOwlHouse":
            continue
        yield submission


logger = getLogger(__name__)


def get_comics() -> Generator[models.Submission, None, None]:
    candidates = get_new_comics()
    valid_candidates = filter(is_submission_valid, candidates)
    yield from valid_candidates
