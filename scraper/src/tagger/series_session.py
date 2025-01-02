import asyncio
from io import BytesIO
from logging import getLogger
from typing import TYPE_CHECKING

from prompt_toolkit import HTML, print_formatted_text
from prompt_toolkit.completion import NestedCompleter
from term_image.image import AutoImage
from PIL import Image as PILimage

from src.schema.tables import ComicSeries, ComicSeriesTag, Image
from xml.parsers.expat import ExpatError
from ..storage_service import storage

if TYPE_CHECKING:
    from src.tagger.tagging_session import TaggingSession, SubjectInfo
else:
    TaggingSession = None
    SubjectInfo = None

logger = getLogger(__name__)


class SeriesSession:
    def __init__(
        self, comic_series: SubjectInfo, tagging_session: TaggingSession
    ) -> None:
        self.subject = comic_series
        self.parent = tagging_session
        self.image_cursor = 0
        self.images = [
            asyncio.Future() for _ in range(self.subject["number_of_images"])
        ]
        self.tags_to_add = []

    def start_downloading_images(self):
        self.parent.run_in_background(self._download_images())

    async def _download_images(self):
        images = (
            await Image.select(*Image.all_columns())
            .where(Image.comic._.series._.id == self.subject["id"])
            .order_by(
                Image.comic._.uploaded_at,
                Image.order,
            )
        )
        for i, image in enumerate(images):
            image = Image(**image)
            if image.file_path:
                content = await storage.get_object_bytes(image.file_path)
            else:
                content = None

            self.images[i].set_result(content)

    async def _draw_image(self):
        if len(self.images) <= self.image_cursor:
            self.image_cursor -= 1
        elif self.image_cursor < 0:
            self.image_cursor = 0
        image_bytes = self.images[self.image_cursor]
        if not image_bytes.done():
            try:
                await asyncio.wait_for(asyncio.shield(image_bytes), 5)
            except TimeoutError:
                logger.error("Timeout waiting on image")
                return
        image_bytes = image_bytes.result()
        if image_bytes is None:
            return
        io = BytesIO(image_bytes)
        img = PILimage.open(io)
        auto_image = AutoImage(img, height=30)
        auto_image.draw(h_align="left", v_align="bottom", pad_height=10)
        print(f"({self.image_cursor + 1}/{len(self.images)})")

    def _print_separator(self):
        separator = "=" * 20
        print_formatted_text(f"\n{separator}\n")

    async def _print_series_details(self):
        tags = await ComicSeries.raw(
            """
        SELECT 
            tag.name 
        FROM 
            comic_series 
            JOIN comic_series_tag 
                ON comic_series_tag.comic_series = comic_series.id 
            JOIN tag 
                ON tag.id = comic_series_tag.tag 
        WHERE comic_series.id = {};
        """,
            self.subject["id"],
        )
        self._print_separator()
        text = f"""
<b>Title:</b>\t<i>{self.subject['title']}</i>
<b>Tags:</b>\t<i>{", ".join([tag['name'] for tag in tags])}</i>
        """
        try:
            print_formatted_text(HTML(text))
        except ExpatError:
            print_formatted_text(text)

    async def prompt_user(self):
        completer = NestedCompleter.from_nested_dict(
            {
                "tag": await self.parent.tag_sheet.get_completer(),
                "new": None,
                "save": None,
                "next": None,
                "previous": None,
                "list": None,
                "clear": None,
                "revert": None,
            }
        )
        while True:
            user_input: str = await self.parent.session.prompt_async(
                "$ ", completer=completer
            )
            if " " in user_input:
                command, args = user_input.split(" ", 1)
            else:
                command = user_input
                args = None
            if command == "save":
                break
            yield command, args

    async def add_tag(self, tag_name):
        if tag_name is None:
            logger.error("Can't add empty tag")
            return
        if "," in tag_name:
            tags = [t.strip() for t in tag_name.split(",")]
            tags = filter(lambda t: len(t) > 0, tags)
        else:
            tags = [tag_name.strip()]
        for tag_name in tags:
            tag = await self.parent.tag_sheet.get(tag_name)
            self.tags_to_add.append(tag)
            print_formatted_text(f"Added tag {tag}")

    async def save_subject_with_new_tags(self):
        operation = ComicSeriesTag.insert()
        for tag in self.tags_to_add:
            operation.add(ComicSeriesTag(tag=tag.id, comic_series=self.subject["id"]))
        await operation

    async def tag_series(self):
        await self._draw_image()
        await self._print_series_details()
        async for command, args in self.prompt_user():
            match command:
                case "new":
                    try:
                        await self.parent.tag_sheet.create(args)
                        await self.add_tag(args)
                    except AssertionError:
                        print("Failed to create tag, duplicate exists")
                case "tag":
                    try:
                        await self.add_tag(args)
                    except KeyError:
                        logger.error(f"Tag {args} does not exist")
                case "next":
                    self.image_cursor += 1
                    await self._draw_image()
                case "previous":
                    self.image_cursor -= 1
                    await self._draw_image()
                case "list":
                    await self._print_series_details()
                case "clear":
                    await ComicSeriesTag.delete().where(
                        ComicSeriesTag.comic_series == self.subject["id"]
                    )
                    self.tags_to_add = []
                    await self._print_series_details()
                case "revert":
                    self.tags_to_add.pop()
                    await self._print_series_details()
                case _:
                    print_formatted_text("unknown command")
        self.parent.run_in_background(self.save_subject_with_new_tags())
