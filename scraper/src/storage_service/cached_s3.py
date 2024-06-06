from logging import getLogger

from .s3 import S3Storage

logger = getLogger(__name__)


class CachedS3Storage(S3Storage):
    def __init__(self, bucket_name: str) -> None:
        super().__init__(bucket_name=bucket_name)
        self.string_cache = {}

    async def get_object(self, key):
        if result := self.string_cache.get(key):
            logger.info(f"Skipping Read on {key}")
            return result
        result = await super().get_object(key)
        self.string_cache[key] = result
        return result

    async def put_object(self, key, value):
        if self.string_cache.get(key) == value:
            logger.info(f"Skipping Write on {key}")
            return
        self.string_cache[key] = value
        return await super().put_object(key, value)
