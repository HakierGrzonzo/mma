from collections import defaultdict
from dataclasses import asdict
import json
from typing import List, Optional
from praw import models
from os import listdir, mkdir, path, rmdir
from scrape.corrections import correct_line
from scrape.metadata import SubmissionMetadata

from scrape.process_image import extract_image_size, process_image
from .reddit import session
from time import sleep
import re

DOWNLOAD_PATH = "./results"

GROM_FACTOR = "Grom Factor"
A_LITTLE_HINT_OF_BLUE = "A Little Hint of Blue"
MAMA_EDA = "Mama Eda"

A_LITTLE_HINT_OF_BLUE_CHAPTER_AND_PART = re.compile(r"Chapter (\d+) Part (\d+)")
MAMA_EDA_PART = re.compile(r"\(([0-9]+)\/[0-9]+\)")


def get_possible_series(submission: models.Submission) -> Optional[str]:
    title: str = submission.title

    if title.startswith(GROM_FACTOR):
        return GROM_FACTOR

    if title.startswith(A_LITTLE_HINT_OF_BLUE):
        return A_LITTLE_HINT_OF_BLUE

    if title.startswith(MAMA_EDA) and submission.id != "yd5jpn":
        return MAMA_EDA

    return f"{title}-{submission.id}"

def get_name(submission: SubmissionMetadata) -> Optional[str]:
    title: str = submission.submission_title

    if title.startswith(GROM_FACTOR):
        return GROM_FACTOR

    if title.startswith(A_LITTLE_HINT_OF_BLUE):
        return A_LITTLE_HINT_OF_BLUE

    if title.startswith(MAMA_EDA):
        return MAMA_EDA

    return title 

def get_suffix(submission: models.Submission) -> str:
    title: str = submission.title
    series = get_possible_series(submission)

    if series == GROM_FACTOR:
        if "#" not in title:
            return "00_"
        _, number = title.split("#")
        return number.strip().zfill(2) + "_"

    if series == A_LITTLE_HINT_OF_BLUE:
        if "#" in title:
            return "00_"
        if match := A_LITTLE_HINT_OF_BLUE_CHAPTER_AND_PART.search(title):
            chapter, part = match.groups()
            return f"{chapter}, {part.zfill(2)}_"
        raise Exception(f"Failed to parse {title}")

    if series == MAMA_EDA:
        if title == MAMA_EDA:
            return "1_"

        if match := MAMA_EDA_PART.search(title):
            chapter = match.groups()[0]
            return f"{chapter}_"

    return ""


class SeriesDownloader:
    def __init__(self, name: str) -> None:
        self.name = name
        self.has_content = False
        self.has_changed = False
        self.path = path.join(DOWNLOAD_PATH, name.replace("/", "").replace("#", ""))
        self.metadata: List[SubmissionMetadata] = []
        try:
            mkdir(self.path)
        except:
            self.has_content = True

    def get_all_image_files(self):
        for file in listdir(self.path):
            if not file.endswith(".webp"):
                continue
            full_path = path.join(self.path, file)
            yield full_path

    def download(self, submission: models.Submission):
        metadata = SubmissionMetadata.from_submission(submission)
        try:
            items = submission.gallery_data.get("items")
        except AttributeError:
            print(f"{submission.title} is not a gallery, skipping")
            return
        self.has_content = True
        print(f"Downloading {submission.title}")
        if items is None:
            print(f"{submission.title} is not a gallery, skipping")
            return
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
            result = session.get(biggest_picture, headers={"Accept": "image/webp"})
            with open(final_path, "wb+") as f:
                f.write(result.content)
            sleep(0.2)

        self.metadata.append(metadata)

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
