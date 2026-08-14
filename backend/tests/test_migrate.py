"""Tests for the deploy-time migration entrypoint.

The advisory-lock behaviour is what makes concurrent container starts safe, so
most of these assert on the exact lock/unlock statements and their ordering
rather than just on the happy path.
"""

import logging
from unittest.mock import MagicMock

import pytest

from alembic.script import ScriptDirectory
from app import migrate


def _engine_mock(dialect_name):
    """Build an engine whose `connect()` works as a context manager."""
    engine = MagicMock()
    engine.dialect.name = dialect_name
    connection = MagicMock()
    engine.connect.return_value.__enter__.return_value = connection
    return engine, connection


def _executed_sql(connection):
    """Return the SQL text of every statement run on the connection."""
    return [str(call.args[0]) for call in connection.execute.call_args_list]


@pytest.fixture
def patched(monkeypatch):
    """Stub out Alembic and seeding; return the doubles for assertions."""
    upgrade = MagicMock()
    seed = MagicMock()
    monkeypatch.setattr(migrate.command, "upgrade", upgrade)
    monkeypatch.setattr(migrate, "seed_currencies", seed)
    monkeypatch.setenv("DATABASE_URL", "postgresql://u:p@localhost/db")
    return upgrade, seed


@pytest.fixture(autouse=True)
def restore_root_log_level():
    """run_migrations() mutates the root logger; don't leak that across tests."""
    original = logging.getLogger().level
    yield
    logging.getLogger().setLevel(original)


def test_alembic_config_resolves_independently_of_cwd(tmp_path, monkeypatch):
    # The container runs this from /app; a wrong script_location would only
    # surface at deploy time, so resolve it for real rather than mocking.
    monkeypatch.chdir(tmp_path)

    config = migrate._alembic_config()
    script_dir = ScriptDirectory.from_config(config)

    assert config.get_main_option("script_location").endswith("alembic")
    assert script_dir.get_heads(), "no Alembic head revision discovered"


def test_skips_entirely_without_database_url(monkeypatch):
    monkeypatch.delenv("DATABASE_URL", raising=False)
    get_engine = MagicMock()
    monkeypatch.setattr(migrate, "get_engine", get_engine)

    migrate.run_migrations()

    get_engine.assert_not_called()


def test_non_postgres_skips_the_advisory_lock(monkeypatch, patched):
    upgrade, seed = patched
    engine, connection = _engine_mock("sqlite")
    monkeypatch.setattr(migrate, "get_engine", lambda: engine)

    migrate.run_migrations()

    assert _executed_sql(connection) == []
    upgrade.assert_called_once()
    seed.assert_called_once_with()
    engine.dispose.assert_called_once_with()


def test_postgres_takes_and_releases_the_lock(monkeypatch, patched):
    upgrade, seed = patched
    engine, connection = _engine_mock("postgresql")
    monkeypatch.setattr(migrate, "get_engine", lambda: engine)

    migrate.run_migrations()

    statements = _executed_sql(connection)
    assert statements == [
        "SELECT pg_advisory_lock(:lock_id)",
        "SELECT pg_advisory_unlock(:lock_id)",
    ]
    # Both statements must bind the same, stable lock id.
    for call in connection.execute.call_args_list:
        assert call.args[1] == {"lock_id": migrate.MIGRATION_LOCK_ID}
    # Session-scoped locks need the surrounding transaction committed.
    assert connection.commit.call_count == 2
    upgrade.assert_called_once()
    seed.assert_called_once_with()


def test_lock_is_acquired_before_upgrade_and_released_after_seed(monkeypatch, patched):
    upgrade, seed = patched
    engine, connection = _engine_mock("postgresql")
    monkeypatch.setattr(migrate, "get_engine", lambda: engine)

    order = []
    connection.execute.side_effect = lambda stmt, *a, **kw: order.append(str(stmt))
    upgrade.side_effect = lambda *a, **kw: order.append("upgrade")
    seed.side_effect = lambda *a, **kw: order.append("seed")

    migrate.run_migrations()

    assert order == [
        "SELECT pg_advisory_lock(:lock_id)",
        "upgrade",
        "seed",
        "SELECT pg_advisory_unlock(:lock_id)",
    ]


def test_lock_released_when_upgrade_fails(monkeypatch, patched):
    upgrade, seed = patched
    engine, connection = _engine_mock("postgresql")
    monkeypatch.setattr(migrate, "get_engine", lambda: engine)
    upgrade.side_effect = RuntimeError("boom")

    # A failed migration must fail loudly rather than start the app on an old
    # schema -- but it must not strand the advisory lock either.
    with pytest.raises(RuntimeError, match="boom"):
        migrate.run_migrations()

    assert "SELECT pg_advisory_unlock(:lock_id)" in _executed_sql(connection)
    seed.assert_not_called()


def test_root_log_level_restored_after_alembic_lowers_it(monkeypatch, patched):
    upgrade, _ = patched
    engine, _connection = _engine_mock("sqlite")
    monkeypatch.setattr(migrate, "get_engine", lambda: engine)

    # alembic.ini's fileConfig resets the root logger to WARNING, which used to
    # silence everything afterwards -- including a failing seed.
    upgrade.side_effect = lambda *a, **kw: logging.getLogger().setLevel(logging.WARNING)

    migrate.run_migrations()

    assert logging.getLogger().level == logging.INFO


def test_main_returns_zero_on_success(monkeypatch):
    monkeypatch.setattr(migrate, "run_migrations", MagicMock())

    assert migrate.main() == 0


def test_main_returns_one_on_failure(monkeypatch):
    monkeypatch.setattr(
        migrate, "run_migrations", MagicMock(side_effect=RuntimeError("boom"))
    )

    # Non-zero exit is what fails the deploy step in CI.
    assert migrate.main() == 1
