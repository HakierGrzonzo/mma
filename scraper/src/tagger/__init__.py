from prompt_toolkit import PromptSession
from src.schema.tables import Tag
from src.tagger.tag_sheet import TagSheet
from .tagging_session import TaggingSession


async def add_tags_to_series():
    session = TaggingSession()
    await session.tagging_loop()


async def review_tags():
    tag_sheet = TagSheet()
    prompt_session = PromptSession()
    tags = await tag_sheet.get_all()
    for tag in tags:
        if tag.description is not None and len(tag.description.strip()) > 0:
            continue
        print(tag.name)
        command = await prompt_session.prompt_async("$ ")
        command = command.strip()
        if len(command) > 0:
            await Tag.update({"description": command}).where(Tag.id == tag.id)
