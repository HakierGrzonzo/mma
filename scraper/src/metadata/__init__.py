import asyncio
from dataclasses import asdict, dataclass, field
import json
from logging import getLogger
from typing import AsyncGenerator, DefaultDict, Dict, List
from collections import defaultdict
from os import path

from ..storage_service import storage

from ..reduce import ComicSeries

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

    async def is_downloaded(self):
        if self.file_path is None:
            return False
        return await storage.object_exists(self.file_path)


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
        return sanitized

    def get_metadata_path(self):
        return path.join(self.get_filepath_prefix(), "metadata.json")

    @classmethod
    async def from_series(cls, series: ComicSeries):
        instance = cls(series=series)
        meta_path = instance.get_metadata_path()
        if await storage.object_exists(meta_path):
            meta = await storage.get_object(meta_path)
            try:
                for k, v in json.loads(meta)["images"].items():
                    instance.images[k] = Image(**v)
            except json.JSONDecodeError:
                logger.warn(f"Broken metadata in {meta_path}")

        return instance

    async def save(self):
        path = self.get_metadata_path()
        logger.info(f"Writing {self.series.title} to {path}")
        data = asdict(self)
        await storage.put_object(path, json.dumps(data))


async def load_metadata_from_filesystem(
    series: List[ComicSeries]
) -> AsyncGenerator[Metadata, None]:
    for m in asyncio.as_completed([Metadata.from_series(s) for s in series]):
        yield await m


async def save_metadata(metas: AsyncGenerator[Metadata, None]):
    async for m in metas:
        await m.save()
        yield m


async def save_index_metadata(metas: List[Metadata]):
    metadata_index = {meta.series.id: asdict(meta) for meta in metas}
    logger.info(f"Writing index metadata with {len(metas)} series")
    await storage.put_object("index.json", json.dumps(metadata_index))
