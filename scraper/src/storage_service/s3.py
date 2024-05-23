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

    def object_exists(self, key: str) -> bool:
        try:
            self._s3.head_object(Bucket=self._bucket_name, Key=key)
            return True
        except botocore.exceptions.ClientError as e:
            # AWS returns the error code as str
            if e.response["Error"]["Code"] == "404":
                return False
            breakpoint()
            raise e

    def get_object_bytes(self, key):
        io = BytesIO()
        self._bucket.download_fileobj(key, io)
        io.seek(0)
        return io.read()

    def get_object(self, key):
        return self.get_object_bytes(key).decode()

    def put_object_bytes(self, key, value):
        io = BytesIO(value)
        self._bucket.upload_fileobj(io, key)

    def put_object(self, key, value):
        self.put_object_bytes(key, value.encode())
