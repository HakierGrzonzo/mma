import asyncio
from sys import argv
from . import main
from .migrations import run_migrations

if "migrate" in argv:
    asyncio.run(run_migrations())
else:
    asyncio.run(main())
