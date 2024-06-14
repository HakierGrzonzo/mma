from typing import Generator


class BaseService:
    async def put_object(self, key: str, value: str) -> None:
        raise NotImplementedError()

    async def get_object(self, key: str) -> str:
        raise NotImplementedError()

    async def object_exists(self, key: str) -> bool:
        raise NotImplementedError()

    async def put_object_bytes(self, key: str, value: bytes) -> None:
        raise NotImplementedError()

    async def get_object_bytes(self, key: str) -> bytes:
        raise NotImplementedError()

    def list_objects_in_root(self) -> Generator[str, None, None]:
        raise NotImplementedError()
