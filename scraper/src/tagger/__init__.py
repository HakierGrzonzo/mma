from prompt_toolkit import PromptSession
from src.tagger.tag_sheet import TagSheet
from .tagging_session import TaggingSession


async def add_tags_to_series():
    session = await TaggingSession.start()
    await session.tagging_loop()


async def review_tags():
    tag_sheet = await TagSheet.from_file_system()
    prompt_session = PromptSession()
    for tag in tag_sheet:
        if tag.details is not None:
            continue
        print(tag)
        command = await prompt_session.prompt_async("$ ")
        command = command.strip()
        if len(command) > 0:
            tag.details = command
    await tag_sheet.save()
