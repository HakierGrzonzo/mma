from logging import getLogger
import os

from .s3 import S3Storage
from .filesystem import FileSystemStorage


BUCKET = os.environ.get("BUCKET")
logger = getLogger(__name__)

if BUCKET is None:
    logger.warn("S3 Bucket not specified, running against the filesystem")
    storage = FileSystemStorage("./results")
else:
    storage = S3Storage(BUCKET)


__all__ = ("storage",)
