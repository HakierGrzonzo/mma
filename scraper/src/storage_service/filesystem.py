from .base import BaseService

from os import mkdir, path


class FileSystemStorage(BaseService):
    def __init__(self, directory_prefix: str) -> None:
        self._directory_prefix = directory_prefix

    def _get_full_path(self, key: str):
        return path.join(self._directory_prefix, key)

    def _ensure_directory_exists(self, key: str):
        directory = path.dirname(key)
        full_path = self._get_full_path(directory)

        if path.isdir(full_path):
            return

        mkdir(full_path)

    def put_object(self, key, value):
        self._ensure_directory_exists(key)
        full_path = self._get_full_path(key)
        with open(full_path, "w+") as f:
            f.write(value)

    def put_object_bytes(self, key, value):
        self._ensure_directory_exists(key)
        full_path = self._get_full_path(key)
        with open(full_path, "wb+") as f:
            f.write(value)

    def get_object(self, key):
        full_path = self._get_full_path(key)
        with open(full_path) as f:
            return f.read()

    def get_object_bytes(self, key):
        full_path = self._get_full_path(key)
        with open(full_path, "rb") as f:
            return f.read()

    def object_exists(self, key):
        full_path = self._get_full_path(key)
        return path.isfile(full_path)
