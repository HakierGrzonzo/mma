from praw import models


def is_submission_valid(submission: models.Submission):
    if vars(submission).get("removed_by_category"):
        return False
    return True
