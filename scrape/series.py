from collections import defaultdict
from dataclasses import asdict
import json
from typing import List, Optional, Tuple
from praw import models
from os import listdir, mkdir, path, rmdir
from scrape.corrections import correct_line
from scrape.metadata import SubmissionMetadata

from scrape.process_image import extract_image_size, process_image
from .reddit import session
from time import sleep
import re

DOWNLOAD_PATH = "./results"


def hash_extractor(title: str):
    if "#" not in title:
        return "00_"
    _, number = title.split("#")
    return number.strip().zfill(2) + "_"


A_LITTLE_HINT_OF_BLUE_CHAPTER_AND_PART = re.compile(r"Chapter (\d+) Part (\d+)")


def a_little_hint_of_blue_extractor(title: str):
    if "#" in title:
        return "00_"
    if match := A_LITTLE_HINT_OF_BLUE_CHAPTER_AND_PART.search(title):
        chapter, part = match.groups()
        return f"{chapter}, {part.zfill(2)}_"
    raise Exception(f"Failed to parse {title}")


GENERIC_PART = re.compile(r"\(([0-9]+)\/[0-9]+\)")


def generic_extractor(title: str):
    if match := GENERIC_PART.search(title):
        chapter = match.groups()[0]
        return f"{chapter}_"
    else:
        return "1_"


series: List[Tuple[str, List[str]]] = [
    ("Grom Factor", []),
    ("A Little Hint of Blue", []),
    ("Mama Eda", ["yd5jpn"]),
    ("Milan", []),
    ("Pandora", []),
    ("The Hexsquad", []),
]

series_name_to_extractor = {
    "Grom Factor": hash_extractor,
    "The Hexsquad": hash_extractor,
    "A Little Hint of Blue": a_little_hint_of_blue_extractor,
}


def get_possible_series(submission: models.Submission) -> Optional[str]:
    title: str = submission.title

    for series_title, banned_ids in series:
        if submission.id in banned_ids:
            continue
        if title.startswith(series_title):
            return series_title

    return None


def get_name(submission: SubmissionMetadata) -> Optional[str]:
    title: str = submission.submission_title

    for series_title, _ in series:
        if title.startswith(series_title):
            return series_title

    return title


def is_image(path: str):
    return any(
        path.endswith(suffix) for suffix in ["jpeg", "jpg", "png", "webp"]
    )


def get_suffix(submission: models.Submission) -> str:
    title: str = submission.title
    series = get_possible_series(submission)
    if series is None:
        return ""

    extractor = series_name_to_extractor.get(series, generic_extractor)
    return extractor(title)


class SeriesDownloader:
    def __init__(self, name: str) -> None:
        self.name = name
        self.has_content = False
        self.has_changed = False
        self.path = path.join(
            DOWNLOAD_PATH,
            name.replace("/", "").replace("#", "").replace("%", ""),
        )
        self.metadata: List[SubmissionMetadata] = []
        try:
            mkdir(self.path)
        except:
            self.has_content = True

    def get_all_image_files(self):
        for file in listdir(self.path):
            if not is_image(file):
                continue
            full_path = path.join(self.path, file)
            yield full_path

    def _download_gallery(self, submission: models.Submission):
        metadata = SubmissionMetadata.from_submission(submission)
        items = submission.gallery_data.get("items")
        self.has_content = True
        for i, media_refrence in enumerate(items):
            print(f"{i+1}/{len(items)}", end="\r")

            media = submission.media_metadata[media_refrence["media_id"]]
            biggest_picture = media.get("s").get("u")
            if biggest_picture is None:
                continue

            name = f"{get_suffix(submission)}{i}"
            final_path = f"{path.join(self.path, name)}.webp"
            metadata.add_image_path(final_path)

            if path.isfile(final_path):
                continue

            self.has_changed = True
            result = session.get(
                biggest_picture, headers={"Accept": "image/webp"}
            )
            with open(final_path, "wb+") as f:
                f.write(result.content)
            sleep(0.2)

        self.metadata.append(metadata)

    def _download_single(self, submission: models.Submission):
        metadata = SubmissionMetadata.from_submission(submission)
        image_url = submission.url
        if not is_image(image_url):
            print(f"{submission.title} is not an image")

        suffix = image_url.split(".")[-1]
        name = get_suffix(submission) or "image"
        final_path = f"{path.join(self.path, name)}.{suffix}"

        metadata.add_image_path(final_path)
        self.metadata.append(metadata)

        if path.isfile(final_path):
            return
        self.has_changed = True
        self.has_content = True

        result = session.get(image_url, headers={"Accept": "image/webp"})
        with open(final_path, "wb+") as f:
            f.write(result.content)

    def download(self, submission: models.Submission):
        print(f"Downloading {submission.title}")
        if removed_by := vars(submission).get("removed_by_category"):
            print(f"{submission.title} was removed by {removed_by}")
            return
        if vars(submission).get("is_gallery"):
            self._download_gallery(submission)
        else:
            self._download_single(submission)

    def extract_content_text(self):
        results = {
            path: correct_line(process_image(path))
            for path in self.get_all_image_files()
        }
        if len(results.values()):
            with open(path.join(self.path, "ocr.json"), "w+") as f:
                json.dump(results, f)

    def extract_image_sizes(self):
        results = {
            path: extract_image_size(path)
            for path in self.get_all_image_files()
        }

        with open(path.join(self.path, "images.json"), "w+") as f:
            json.dump(results, f)

    def close(self):
        if not self.has_content:
            rmdir(self.path)
            return
        self.extract_image_sizes()
        if len(self.metadata):
            with open(path.join(self.path, "metadata.json"), "w+") as metadata:
                submissions = list(asdict(m) for m in reversed(self.metadata))
                json.dump(
                    {
                        "name": get_name(self.metadata[0]),
                        "submissions": submissions,
                        "upvotes_total": sum(s.upvotes for s in self.metadata),
                        "latest_episode": self.metadata[0].uploaded_at,
                    },
                    metadata,
                )
        if self.has_changed:
            print(f"Processing OCR for {self.name}")
            self.extract_content_text()


class SeriesSavers(defaultdict):
    def __missing__(self, __key: str) -> SeriesDownloader:
        downloader = SeriesDownloader(__key)
        self[__key] = downloader
        return self[__key]

    def populate_from_dir(self):
        for folder in listdir(DOWNLOAD_PATH):
            self[folder] = SeriesDownloader(folder)
        return self
