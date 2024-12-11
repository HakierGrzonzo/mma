import asyncio
from ..tagger.tagging_session import get_metas
from ..tagger.tag_sheet import TagSheet
from .tables import ComicSeries, ComicSeriesTag, Image, Tag, Comic


async def import_existing_data():
    metadatas, tag_sheet = await asyncio.gather(
        get_metas(), TagSheet.from_file_system()
    )
    async with ComicSeries._meta.db.transaction():
        await Tag.insert(
            *[
                Tag(id=tag.id, name=tag.name, description=tag.details)
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
