from dataclasses import dataclass
from datetime import datetime
from typing import List

from praw.reddit import models


@dataclass
class SubmissionMetadata:
    submission_title: str
    images: List[str]
    upvotes: int
    link: str
    uploaded_at: str

    @classmethod
    def from_submission(cls, submission: models.Submission):
        date = datetime.fromtimestamp(submission.created).isoformat()
        return cls(
            submission_title=submission.title,
            upvotes=submission.score,
            images=[],
            link=submission.shortlink,
            uploaded_at=date,
        )

    def add_image_path(self, image):
        self.images.append(image)
