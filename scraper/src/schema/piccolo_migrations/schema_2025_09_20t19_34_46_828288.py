from piccolo.apps.migrations.auto.migration_manager import MigrationManager
from enum import Enum
from piccolo.columns.column_types import Text
from piccolo.columns.indexes import IndexMethod


ID = "2025-09-20T19:34:46:828288"
VERSION = "1.22.0"
DESCRIPTION = ""


async def forwards():
    manager = MigrationManager(
        migration_id=ID, app_name="schema", description=DESCRIPTION
    )

    manager.add_column(
        table_class_name="ComicSeries",
        tablename="comic_series",
        column_name="show",
        db_column_name="show",
        column_class_name="Text",
        column_class=Text,
        params={
            "default": "The Owl House",
            "null": False,
            "primary_key": False,
            "unique": False,
            "index": False,
            "index_method": IndexMethod.btree,
            "choices": Enum(
                "Shows", {"TOH": "The Owl House", "KOG": "Knights of Guinevere"}
            ),
            "db_column_name": None,
            "secret": False,
        },
        schema=None,
    )

    return manager
