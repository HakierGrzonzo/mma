from . import scrape, index
from sys import argv

command = argv[1]

if command == "scrape":
    scrape()
elif command == "index":
    index()
