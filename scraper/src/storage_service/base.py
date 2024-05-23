class BaseService:
    def put_object(self, key: str, value: str) -> None:
        raise NotImplemented()

    def get_object(self, key: str) -> str:
        raise NotImplemented()

    def object_exists(self, key: str) -> bool:
        raise NotImplemented()

    def put_object_bytes(self, key: str, value: bytes) -> None:
        raise NotImplemented()

    def get_object_bytes(self, key: str) -> bytes:
        raise NotImplemented()
