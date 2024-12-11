from piccolo.conf.apps import AppRegistry
from piccolo.engine.sqlite import SQLiteEngine


DB = SQLiteEngine(log_queries=False, path="./mma.sqlite")


# A list of paths to piccolo apps
# e.g. ['blog.piccolo_app']
APP_REGISTRY = AppRegistry(apps=['src.schema.piccolo_app'])
