import asyncio
from collections import defaultdict
from dataclasses import dataclass, field
from os import path
from ..storage_service import storage
import json
from .tables import ComicSeries, ComicSeriesTag, Image, Tag, Comic


async def get_tags() -> list[dict]:
    raw_sheet = await storage.get_object("tags.json")
    json_sheet = json.loads(raw_sheet)
    return json_sheet


@dataclass
class ComicWithPrefix:
    title: str
    image_urls: list[str]
    upvotes: int
    link: str
    uploaded_at: str
    id: str
    prefix: str | None = None


@dataclass
class OldComicSeries:
    title: str
    id: str
    comics: list[ComicWithPrefix]

    def latest_update(self):
        return self.comics[-1].uploaded_at

    @classmethod
    def from_dict(cls, value: dict):
        comics = value["comics"]
        comics = [ComicWithPrefix(**v) for v in comics]
        return cls(title=value["title"], id=value["id"], comics=comics)


@dataclass
class Metadata:
    series: OldComicSeries
    tags: list[int] = field(default_factory=lambda: list())
    images: defaultdict[str, Image] | dict[str, Image] = field(
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
    def from_dict(cls, value: dict):
        series = OldComicSeries.from_dict(value["series"])
        images = {k: Image(**v) for k, v in value["images"].items()}
        tags = value.get("tags", [])
        unique_tags = set(tags)
        return cls(tags=list(unique_tags), series=series, images=images)


async def get_metas():
    all_series = await storage.get_object("index.json")
    all_series = json.loads(all_series)
    all_series = [Metadata.from_dict(v) for v in all_series.values()]
    sorted_series = sorted(
        all_series, key=lambda item: item.series.latest_update(), reverse=True
    )
    return sorted_series


async def import_existing_data():
    metadatas, tag_sheet = await asyncio.gather(get_metas(), get_tags())
    async with ComicSeries._meta.db.transaction():
        await Tag.insert(
            *[
                Tag(id=tag["id"], name=tag["name"], description=tag["details"])
                for tag in tag_sheet
            ]
        )

        insert_comic_series = ComicSeries.insert()
        insert_series_tags = ComicSeriesTag.insert()
        insert_comics = Comic.insert()
        insert_images = Image.insert()

        for m in metadatas:
            insert_comic_series.add(ComicSeries(id=m.series.id, title=m.series.title))
            for comic in m.series.comics:
                insert_comics.add(
                    Comic(
                        id=comic.id,
                        title=comic.title,
                        upvotes=comic.upvotes,
                        uploaded_at=comic.uploaded_at,
                        series=m.series.id,
                    )
                )
                for order, comic_img in enumerate(comic.image_urls):
                    img = m.images[comic_img]
                    insert_images.add(
                        Image(
                            link=comic_img,
                            ocr=img.ocr,
                            height=img.height,
                            width=img.width,
                            file_path=img.file_path,
                            order=order,
                            comic=comic.id,
                        )
                    )

            for tag in m.tags:
                insert_series_tags.add(
                    ComicSeriesTag(tag=tag, comic_series=m.series.id)
                )
        await insert_comic_series
        await insert_series_tags
        await insert_comics
        await insert_images
