import asyncio
from datetime import timedelta
from sys import argv

from src import tagger
from . import main
from .migrations import run_migrations
from .trigger_frontend_regen import trigger_frontend_regen


async def run():
    if "tag" in argv:
        await tagger.main()
        return
    if "migrate" in argv:
        await run_migrations()
        return

    ten_minutes = timedelta(minutes=10)
    async with asyncio.timeout(ten_minutes.total_seconds()):
        await main()
        if "deploy" in argv:
            trigger_frontend_regen()


asyncio.run(run())
