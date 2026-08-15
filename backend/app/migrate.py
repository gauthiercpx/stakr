"""One-shot schema migration + reference-data seeding.

Previously this ran from ``entrypoint.sh`` as two separate ``python -m``
invocations on every container start. That cost two extra interpreter boots
(each importing SQLAlchemy and the whole model package) on the critical path of
a cold start, and -- because the app scales out -- let several replicas race
each other into a concurrent ``alembic upgrade head``.

This module does both in a single process, guarded by a PostgreSQL advisory
lock so only one process migrates at a time. It is intended to be run as a
deploy step (see ``.github/workflows/backend-deploy.yml``) rather than on boot;
``entrypoint.sh`` will still run it when ``RUN_MIGRATIONS=1`` for local
development.
"""

import logging
import os
import sys
from pathlib import Path

from sqlalchemy import text

from alembic import command
from alembic.config import Config
from app.core.database import get_engine
from app.seed import seed_currencies

logger = logging.getLogger(__name__)

# Stable, arbitrary identifier for the schema-migration advisory lock. Any
# other process using pg_advisory_lock must not reuse this value.
MIGRATION_LOCK_ID = 4_051_965_207

BACKEND_DIR = Path(__file__).resolve().parent.parent


def _alembic_config() -> Config:
    """Build an Alembic config that works regardless of the current directory."""
    ini_path = BACKEND_DIR / "alembic.ini"
    config = Config(str(ini_path))
    config.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
    return config


def run_migrations() -> None:
    """Upgrade the schema to head and seed reference data.

    Raises whatever Alembic raises on failure: a failed migration must fail the
    deploy loudly rather than leave the app running against an old schema.
    """
    if not os.getenv("DATABASE_URL"):
        logger.info("DATABASE_URL is not set; skipping migrations.")
        return

    engine = get_engine()
    is_postgres = engine.dialect.name == "postgresql"

    # The advisory lock is session-scoped, so it is held for exactly as long as
    # this connection stays open. Other replicas block here instead of issuing
    # a competing upgrade.
    with engine.connect() as connection:
        if is_postgres:
            logger.info("Acquiring migration lock...")
            connection.execute(
                text("SELECT pg_advisory_lock(:lock_id)"),
                {"lock_id": MIGRATION_LOCK_ID},
            )
            connection.commit()

        try:
            logger.info("Running Alembic migrations...")
            command.upgrade(_alembic_config(), "head")
            # alembic.ini's [logger_root] section sets the root level to
            # WARNING while Alembic configures logging. Restore it, otherwise
            # everything below -- including a failed seed -- is swallowed.
            logging.getLogger().setLevel(logging.INFO)
            logger.info("Migrations applied.")

            logger.info("Seeding reference data...")
            seed_currencies()
            logger.info("Seeding completed.")
        finally:
            if is_postgres:
                connection.execute(
                    text("SELECT pg_advisory_unlock(:lock_id)"),
                    {"lock_id": MIGRATION_LOCK_ID},
                )
                connection.commit()

    engine.dispose()


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(levelname)-5.5s [%(name)s] %(message)s",
    )
    try:
        run_migrations()
    except Exception:
        logger.exception("Migration failed.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
