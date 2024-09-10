from typing import TYPE_CHECKING

from prompt_toolkit import HTML, print_formatted_text
from prompt_toolkit.completion import NestedCompleter
from ..metadata import Metadata

if TYPE_CHECKING:
    from src.tagger.tagging_session import TaggingSession
else:
    TaggingSession = None


class SeriesSession:
    def __init__(self, meta: Metadata, tagging_session: TaggingSession) -> None:
        self.subject = meta
        self.parent = tagging_session

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
            {"tag": self.parent.tag_sheet.get_completer(), "new": None, "next": None}
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
            if command == "next":
                break
            yield command, args

    def add_tag(self, tag_name):
        tag = self.parent.tag_sheet.get(tag_name)
        print_formatted_text(f"Added tag {tag}")
        self.subject.tags.append(tag.id)

    async def save_subject_with_new_tags(self):
        pass

    async def tag_series(self):
        self._print_series_details()
        async for command, args in self.prompt_user():
            match command:
                case "new":
                    self.parent.tag_sheet.create(args)
                    self.parent.run_in_background(self.parent.tag_sheet.save())
                case "tag":
                    self.add_tag(args)

                case _:
                    print_formatted_text("unknown command")
        self.parent.run_in_background(self.save_subject_with_new_tags())
