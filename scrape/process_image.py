from easyocr import Reader

reader = Reader(["en"], recog_network="standard")


def process_image(path: str) -> str:
    return "\n".join(reader.readtext(path, detail=0, paragraph=True)).lower()


if __name__ == "__main__":
    from sys import argv

    for x in argv[1:]:
        print(process_image(x))
