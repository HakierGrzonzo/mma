import asyncio
from sys import argv

from src import tagger
from . import main
from .migrations import run_migrations
from .trigger_frontend_regen import trigger_frontend_regen


if "tag" in argv:
    asyncio.run(tagger.add_tags_to_series())
elif "review_tags" in argv:
    asyncio.run(tagger.review_tags())
elif "migrate" in argv:
    asyncio.run(run_migrations())
else:
    asyncio.run(main())

if "deploy" in argv:
    trigger_frontend_regen()
