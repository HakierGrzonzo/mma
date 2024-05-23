from io import BytesIO
from logging import getLogger
from typing import List
import boto3

from src.ocr.corrections import correct_casing
from ..storage_service import storage
from ..metadata import Image
from .block_tree import Node
from PIL import Image as pil_image

logger = getLogger(__name__)


def get_image_as_png(file_path):
    image_bytes = storage.get_object_bytes(file_path)
    io = BytesIO(image_bytes)
    img = pil_image.open(io)

    png_bytes = BytesIO()
    img.save(png_bytes, format="png")

    png_bytes.seek(0)
    return png_bytes


client = boto3.client("textract")


def get_ocr_for_image(image: Image):
    logger.info(f"Doing OCR for {image.file_path}")

    as_png = get_image_as_png(image.file_path)
    result = client.analyze_document(
        Document={"Bytes": as_png.read()}, FeatureTypes=["LAYOUT"]
    )

    blocks: List = result["Blocks"]
    page_block_id = list(filter(lambda block: block["BlockType"] == "PAGE", blocks))[0][
        "Id"
    ]
    id_to_block = {block["Id"]: block for block in blocks}

    tree = Node(id_to_block[page_block_id], id_to_block)
    fixed_text = "\n".join(correct_casing(line) for line in tree.get_text().split("\n"))

    return fixed_text
