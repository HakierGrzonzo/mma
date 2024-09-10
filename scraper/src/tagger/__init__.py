from .tagging_session import TaggingSession


async def main():
    session = await TaggingSession.start()
    await session.tagging_loop()
