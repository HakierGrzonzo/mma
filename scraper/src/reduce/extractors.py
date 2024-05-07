import re


def hash_extractor(title: str):
    if "#" not in title:
        return "00_"
    _, number = title.split("#")
    return number.strip().zfill(2)


A_LITTLE_HINT_OF_BLUE_CHAPTER_AND_PART = re.compile(r"Chapter (\d+) Part (\d+)")


def a_little_hint_of_blue_extractor(title: str):
    if "#" in title:
        return "00"
    if match := A_LITTLE_HINT_OF_BLUE_CHAPTER_AND_PART.search(title):
        chapter, part = match.groups()
        return f"{chapter}, {part.zfill(2)}"
    raise Exception(f"Failed to parse {title}")


GENERIC_PART = re.compile(r"\(([0-9]+)\/([0-9]+|\?)\)")


def generic_extractor(title: str):
    if match := GENERIC_PART.search(title):
        chapter = match.groups()[0]
        return chapter.zfill(2)
    return hash_extractor(title)
