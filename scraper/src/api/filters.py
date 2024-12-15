from praw import models

from ..api.image_urls import get_image_urls


def is_submission_valid(submission: models.Submission):
    if vars(submission).get("removed_by_category"):
        return False
    if len(get_image_urls(submission)) == 0:
        return False
    return True
