from typing import Generator
import praw
from praw import models
import requests
from os import environ

USER_AGENT = "MoringMarkArchiver (by u/hakiergrzonzo)"

session = requests.session()
session.headers.update({"User-Agent": USER_AGENT})

reddit = praw.Reddit(
    user_agent="MoringMarkArchiver (by u/hakiergrzonzo)",
    client_id="xd-riCdiH0xPRTRFIglbCQ",
    client_secret=environ["SECRET"],
)


def get_moring_mark() -> models.Redditor:
    return reddit.redditor("makmark")


def get_new_comics() -> Generator[models.Submission, None, None]:
    mark_mark = get_moring_mark()
    for submission in mark_mark.submissions.new(limit=None):
        if submission.subreddit.display_name != "TheOwlHouse":
            continue
        yield submission
