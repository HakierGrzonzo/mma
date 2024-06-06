from logging import getLogger
import pkgutil
import importlib

migrations = []

logger = getLogger(__name__)

for _, module_name, _ in pkgutil.walk_packages(__path__):
    migrations.append(importlib.import_module(f"{__name__}.{module_name}"))


async def run_migrations():
    for migration in migrations:
        logger.info(f"Running {migration}")
        migration_entrypoint = getattr(migration, "migration")
        await migration_entrypoint()
