from datetime import datetime
from logging import getLogger
from typing import Generator, List
import praw
from praw import models
import httpx 
from os import environ
from dataclasses import dataclass

from .filters import is_submission_valid
from .image_urls import get_image_urls

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


@dataclass
class Comic:
    title: str
    image_urls: List[str]
    upvotes: int
    link: str
    uploaded_at: str
    id: str

    @classmethod
    def from_submission(cls, submission: models.Submission):
        logger.info(f"Processing {submission.title}")
        date = datetime.fromtimestamp(submission.created)
        return cls(
            title=submission.title,
            upvotes=submission.score,
            image_urls=get_image_urls(submission),
            link=submission.shortlink,
            uploaded_at=date.isoformat(),
            id=submission.id,
        )

    def is_valid(self):
        return len(self.image_urls) > 0


def get_comics() -> Generator[Comic, None, None]:
    candidates = get_new_comics()
    valid_candidates = filter(is_submission_valid, candidates)
    comics = [Comic.from_submission(s) for s in valid_candidates]
    valid_comics = filter(lambda c: c.is_valid(), comics)
    yield from valid_comics
