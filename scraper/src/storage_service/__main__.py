import asyncio
from sys import argv

from . import storage
from .s3 import S3Storage

assert isinstance(storage, S3Storage)


async def download():
    with open("./mma.sqlite", "wb+") as file:
        db = await storage.get_object_bytes("mma.sqlite")
        file.write(db)


async def upload():
    with open("./mma.sqlite", "rb") as file:
        await storage.put_object_bytes("mma.sqlite", file.read())


if "down" in argv:
    asyncio.run(download())
elif "up" in argv:
    asyncio.run(upload())
