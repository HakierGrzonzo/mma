import asyncio
from sys import argv

from src import tagger
from . import main
from .migrations import run_migrations
from .trigger_frontend_regen import trigger_frontend_regen


if "tag" in argv:
    asyncio.run(tagger.tag_loop())
elif "migrate" in argv:
    asyncio.run(run_migrations())
else:
    asyncio.run(main())

if "deploy" in argv:
    trigger_frontend_regen()
