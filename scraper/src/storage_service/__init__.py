from logging import getLogger
import os

from .cached_s3 import CachedS3Storage

from .filesystem import FileSystemStorage


BUCKET = os.environ.get("BUCKET")
logger = getLogger(__name__)

if BUCKET is None:
    logger.warn("S3 Bucket not specified, running against the filesystem")
    storage = FileSystemStorage("./results")
else:
    storage = CachedS3Storage(BUCKET)


__all__ = ("storage",)
