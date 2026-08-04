from piccolo.apps.migrations.auto.migration_manager import MigrationManager
from enum import Enum
from piccolo.columns.column_types import Text


ID = "2026-08-04T17:45:24:426026"
VERSION = "1.30.0"
DESCRIPTION = ""


async def forwards():
    manager = MigrationManager(
        migration_id=ID, app_name="schema", description=DESCRIPTION
    )

    manager.alter_column(
        table_class_name="ComicSeries",
        tablename="comic_series",
        column_name="show",
        db_column_name="show",
        params={
            "choices": Enum(
                "Shows",
                {
                    "TOH": "The Owl House",
                    "KOG": "Knights of Guinevere",
                    "FM": "False Memory",
                },
            )
        },
        old_params={
            "choices": Enum(
                "Shows", {"TOH": "The Owl House", "KOG": "Knights of Guinevere"}
            )
        },
        column_class=Text,
        old_column_class=Text,
        schema=None,
    )

    return manager
