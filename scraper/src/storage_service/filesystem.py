import os
import asyncio
from .base import BaseService

from os import mkdir, path

import aiofiles


class FileSystemStorage(BaseService):
    def __init__(self, directory_prefix: str) -> None:
        self._directory_prefix = directory_prefix
        self._lock = asyncio.Semaphore(24)

    def _get_full_path(self, key: str):
        return path.join(self._directory_prefix, key)

    def _ensure_directory_exists(self, key: str):
        directory = path.dirname(key)
        full_path = self._get_full_path(directory)

        if path.isdir(full_path):
            return

        mkdir(full_path)

    async def put_object(self, key, value):
        self._ensure_directory_exists(key)
        full_path = self._get_full_path(key)
        async with self._lock:
            with open(full_path, "w+") as f:
                f.write(value)

    async def put_object_bytes(self, key, value):
        self._ensure_directory_exists(key)
        full_path = self._get_full_path(key)
        async with self._lock:
            async with aiofiles.open(full_path, "wb+") as f:
                await f.write(value)

    async def get_object(self, key):
        full_path = self._get_full_path(key)
        async with self._lock:
            async with aiofiles.open(full_path) as f:
                return await f.read()

    async def get_object_bytes(self, key):
        full_path = self._get_full_path(key)
        async with self._lock:
            async with aiofiles.open(full_path, "rb") as f:
                return await f.read()

    async def object_exists(self, key):
        full_path = self._get_full_path(key)
        return path.isfile(full_path)

    def list_objects_in_root(self):
        yield from [f"{p}/" for p in os.listdir(self._directory_prefix)]
