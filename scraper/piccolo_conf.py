from os import getenv
from piccolo.conf.apps import AppRegistry
from piccolo.engine.sqlite import SQLiteEngine

log_queries = getenv("LOG_QUERIES") is not None

DB = SQLiteEngine(log_queries=log_queries, path="./mma.sqlite")


# A list of paths to piccolo apps
# e.g. ['blog.piccolo_app']
APP_REGISTRY = AppRegistry(apps=["src.schema.piccolo_app"])
