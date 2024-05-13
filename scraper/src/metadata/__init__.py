from dataclasses import asdict, dataclass, field
import json
from logging import getLogger
from os import mkdir, path, unlink
from typing import DefaultDict, Dict, List
from collections import defaultdict


from ..reduce import ComicSeries

DOWNLOAD_PATH = "./results"

logger = getLogger(__name__)


@dataclass
class Image:
    ocr: str | None = None
    height: int | None = None
    width: int | None = None
    file_path: str | None = None

    def is_ocr(self):
        return self.ocr is not None

    def is_measured(self):
        return self.height is not None or self.width is not None

    def is_downloaded(self):
        if self.file_path is None:
            return False
        return path.isfile(self.file_path)


@dataclass
class Metadata:
    series: ComicSeries
    images: DefaultDict[str, Image] | Dict[str, Image] = field(
        default_factory=lambda: defaultdict(lambda: Image())
    )

    def get_filepath_prefix(self):
        unique_title = self.series.id
        sanitized = (
            unique_title.replace("/", "")
            .replace("#", "")
            .replace("%", "")
            .replace("?", "")
        )

        return path.join(DOWNLOAD_PATH, sanitized)

    def get_metadata_path(self):
        return path.join(self.get_filepath_prefix(), "metadata.json")

    @classmethod
    def from_series(cls, series: ComicSeries):
        instance = cls(series=series)
        if path.isfile(meta_path := instance.get_metadata_path()):
            try:
                with open(meta_path) as f:
                    instance.images = {
                        k: Image(**v) for k, v in json.load(f)["images"].items()
                    }
            except json.JSONDecodeError:
                logger.warn(f"Broken metadata in {meta_path}")
                unlink(meta_path)
                pass
        return instance

    def save(self):
        if not path.isdir(meta_path := self.get_filepath_prefix()):
            mkdir(meta_path)

        with open(file_path := self.get_metadata_path(), "w+") as f:
            logger.info(f"Writing {self.series.title} to {file_path}")
            json.dump(asdict(self), f)


def load_metadata_from_filesystem(series: List[ComicSeries]) -> List[Metadata]:
    return [Metadata.from_series(s) for s in series]


def save_metadata(metas: List[Metadata]):
    for m in metas:
        m.save()
