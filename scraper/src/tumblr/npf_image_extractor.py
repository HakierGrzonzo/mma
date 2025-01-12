from bs4 import BeautifulSoup as Soup


def extract_image_urls(npf_string: str):
    soup = Soup(npf_string, "html.parser")
    images = soup.find_all("img")
    for img in images:
        img_src_url = img["src"]
        yield img_src_url
