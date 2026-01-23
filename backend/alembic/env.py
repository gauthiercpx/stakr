import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Ensure the backend/ folder (which contains the `app/` package) is importable.
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Optional local developer convenience.
# In CI/production, prefer injecting DATABASE_URL as an environment variable.
try:
    from dotenv import load_dotenv

    load_dotenv(override=False)
except Exception:
    # dotenv is optional at runtime
    pass

from app.core.database import Base, SQLALCHEMY_DATABASE_URL  # noqa: E402
import models  # noqa: F401, E402  (register ORM models on Base.metadata)

config = context.config

# Alembic's config uses ConfigParser interpolation, where '%' is special.
# Escape percent signs to support URL-encoded credentials (e.g. '%21').
config.set_main_option(
    "sqlalchemy.url",
    (SQLALCHEMY_DATABASE_URL or "").replace("%", "%%"),
)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata used by `alembic revision --autogenerate`
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
