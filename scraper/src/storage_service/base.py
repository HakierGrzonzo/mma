class BaseService:
    async def put_object(self, key: str, value: str) -> None:
        raise NotImplemented()

    async def get_object(self, key: str) -> str:
        raise NotImplemented()

    async def object_exists(self, key: str) -> bool:
        raise NotImplemented()

    async def put_object_bytes(self, key: str, value: bytes) -> None:
        raise NotImplemented()

    async def get_object_bytes(self, key: str) -> bytes:
        raise NotImplemented()
