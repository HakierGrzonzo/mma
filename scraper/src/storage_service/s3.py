import asyncio
from io import BytesIO
from .base import BaseService
import boto3
import botocore


class S3Storage(BaseService):
    def __init__(self, bucket_name: str) -> None:
        self._bucket_name = bucket_name
        self._s3 = boto3.client("s3")
        s3 = boto3.resource("s3")
        self._bucket = s3.Bucket(bucket_name)
        self._rate_limit = asyncio.Semaphore(15)

    def get_object_content_type_from_key(self, key: str):
        mime_map = {
            "webp": "image/webp",
            "json": "application/json",
            "gif": "image/gif",
        }
        file_extension = key.split(".")[-1]
        return mime_map.get(file_extension, "binary/octet-stream")

    async def object_exists(self, key: str) -> bool:
        try:
            await asyncio.to_thread(
                self._s3.head_object, Bucket=self._bucket_name, Key=key
            )
            return True
        except botocore.exceptions.ClientError as e:
            # AWS returns the error code as str
            if e.response["Error"]["Code"] == "404":
                return False
            raise e

    async def get_object_bytes(self, key):
        io = BytesIO()
        async with self._rate_limit:
            try:
                await asyncio.to_thread(self._bucket.download_fileobj, key, io)
            except botocore.exceptions.ClientError:
                raise FileNotFoundError(key)
        io.seek(0)
        return io.read()

    async def get_object(self, key):
        return (await self.get_object_bytes(key)).decode()

    async def put_object_bytes(self, key, value):
        io = BytesIO(value)
        content_type = self.get_object_content_type_from_key(key)
        async with self._rate_limit:
            await asyncio.to_thread(
                self._bucket.upload_fileobj,
                io,
                key,
                ExtraArgs={"ACL": "public-read", "ContentType": content_type},
            )

    async def put_object(self, key, value):
        await self.put_object_bytes(key, value.encode())

    def list_objects_in_root(self):
        paginator = self._s3.get_paginator("list_objects")
        for result in paginator.paginate(Bucket=self._bucket_name, Delimiter="/"):
            for prefix in result.get("CommonPrefixes", []):
                yield prefix.get("Prefix")
