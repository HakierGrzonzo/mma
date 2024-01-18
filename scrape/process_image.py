from easyocr import Reader
from PIL import Image

reader = Reader(["en"], recog_network="standard")


def process_image(path: str) -> str:
    return "\n".join(reader.readtext(path, detail=0, paragraph=True)).lower()


def extract_image_size(path: str):
    im = Image.open(path)
    width, height = im.size
    return {"width": width, "height": height}


if __name__ == "__main__":
    from sys import argv

    for x in argv[1:]:
        print(process_image(x))
