from io import BytesIO
from logging import getLogger
from typing import TYPE_CHECKING

from prompt_toolkit import HTML, print_formatted_text
from prompt_toolkit.completion import NestedCompleter
from term_image.image import AutoImage
from PIL import Image
from ..metadata import Metadata
from ..storage_service import storage

if TYPE_CHECKING:
    from src.tagger.tagging_session import TaggingSession
else:
    TaggingSession = None

logger = getLogger(__name__)


class SeriesSession:
    def __init__(self, meta: Metadata, tagging_session: TaggingSession) -> None:
        self.subject = meta
        self.parent = tagging_session
        self.image_cursor = 0

    async def _draw_image(self):
        image_ids = sum([c.image_urls for c in self.subject.series.comics], start=[])
        if len(image_ids) <= self.image_cursor:
            self.image_cursor -= 1
        elif self.image_cursor < 0:
            self.image_cursor = 0
        image_id_to_draw = image_ids[self.image_cursor]
        image_metadata = self.subject.images[image_id_to_draw]
        if image_metadata is None:
            return
        image_bytes = await storage.get_object_bytes(image_metadata.file_path)
        io = BytesIO(image_bytes)
        img = Image.open(io)
        auto_image = AutoImage(img, height=30)
        auto_image.draw(h_align="left", v_align="bottom", pad_height=10)
        print(f"({self.image_cursor + 1}/{len(image_ids)})")

    def _print_separator(self):
        separator = "=" * 20
        print_formatted_text(f"\n{separator}\n")

    def _print_series_details(self):
        human_readable_tags = self.parent.tag_sheet.resolve_ids_to_names(
            self.subject.tags
        )
        self._print_separator()
        text = f"""
<b>Title:</b>\t<i>{self.subject.series.title}</i>
<b>Tags:</b>\t<i>{", ".join(human_readable_tags)}</i>
        """
        print_formatted_text(HTML(text))

    async def prompt_user(self):
        completer = NestedCompleter.from_nested_dict(
            {
                "tag": self.parent.tag_sheet.get_completer(),
                "new": None,
                "save": None,
                "next": None,
                "previous": None,
                "list": None,
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

    def add_tag(self, tag_name):
        if tag_name is None:
            logger.error("Can't add empty tag")
            return
        tag = self.parent.tag_sheet.get(tag_name)
        print_formatted_text(f"Added tag {tag}")
        self.subject.tags.append(tag.id)

    async def save_subject_with_new_tags(self):
        await self.subject.save()

    async def tag_series(self):
        await self._draw_image()
        self._print_series_details()
        async for command, args in self.prompt_user():
            match command:
                case "new":
                    try:
                        self.parent.tag_sheet.create(args)
                        self.parent.run_in_background(self.parent.tag_sheet.save())
                        self.add_tag(args)
                    except AssertionError:
                        print("Failed to create tag, duplicate exists")
                case "tag":
                    try:
                        self.add_tag(args)
                    except KeyError:
                        logger.error(f"Tag {args} does not exist")
                case "next":
                    self.image_cursor += 1
                    await self._draw_image()
                case "previous":
                    self.image_cursor -= 1
                    await self._draw_image()
                case "list":
                    self._print_series_details()
                case _:
                    print_formatted_text("unknown command")
        self.parent.run_in_background(self.save_subject_with_new_tags())
