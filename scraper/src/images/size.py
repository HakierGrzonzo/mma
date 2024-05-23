from io import BytesIO
from logging import getLogger
from PIL import Image
from ..storage_service import storage

logger = getLogger(__name__)


def extract_image_size(path: str):
    logger.info(f"Measuring {path}")
    image_bytes = storage.get_object_bytes(path)
    io = BytesIO(image_bytes)
    img = Image.open(io)
    width, height = img.size
    return {"width": width, "height": height}
