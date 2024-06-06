import asyncio
from sys import argv
from . import main
from .migrations import run_migrations
from .trigger_frontend_regen import trigger_frontend_regen

if "migrate" in argv:
    asyncio.run(run_migrations())
else:
    asyncio.run(main())

if "deploy" in argv:
    trigger_frontend_regen()
