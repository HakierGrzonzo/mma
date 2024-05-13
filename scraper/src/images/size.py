from logging import getLogger
from PIL import Image

logger = getLogger(__name__)


def extract_image_size(path: str):
    logger.info(f"Measuring {path}")
    img = Image.open(path)
    width, height = img.size
    return {"width": width, "height": height}
