import asyncio
import os # <-- ADDED: for os.getenv
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config

from alembic import context
from dotenv import load_dotenv
load_dotenv() # Load environment variables from .env file

# Import your settings and Base from your application
from app.config import settings
from app.models import Base # <-- ADDED: Import your Base from models.py

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set target_metadata to your Base.metadata for autogenerate support
target_metadata = Base.metadata # <-- MODIFIED: Point to your Base.metadata

# --- MODIFIED BLOCK FOR DATABASE_URL HANDLING ---
# Get DB URL from settings. If settings.DATABASE_URL is None, try os.getenv directly.
db_url_from_settings = settings.DATABASE_URL

# For async operations, SQLAlchemy expects the dialect+driver, e.g., 'postgresql+asyncpg'
DB_URL_FOR_ALEMBIC = None

if db_url_from_settings:
    # If the URL is already loaded from settings, prepare it for asyncpg
    if db_url_from_settings.startswith("postgresql://") and "asyncpg" not in db_url_from_settings:
        DB_URL_FOR_ALEMBIC = db_url_from_settings.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif db_url_from_settings.startswith("postgres://") and "asyncpg" not in db_url_from_settings:
        # Handle older 'postgres://' scheme as well
        DB_URL_FOR_ALEMBIC = db_url_from_settings.replace("postgres://", "postgresql+asyncpg://", 1)
    else:
        DB_URL_FOR_ALEMBIC = db_url_from_settings # Use as is if it's already correct (e.g., contains asyncpg)
else:
    # Fallback: If settings.DATABASE_URL was None, try getting directly from environment
    DB_URL_FOR_ALEMBIC = os.getenv("DATABASE_URL")
    if not DB_URL_FOR_ALEMBIC:
        raise Exception("DATABASE_URL environment variable is not set and cannot be resolved by Alembic.")
    # If fallback worked, ensure asyncpg dialect
    if DB_URL_FOR_ALEMBIC.startswith("postgresql://") and "asyncpg" not in DB_URL_FOR_ALEMBIC:
        DB_URL_FOR_ALEMBIC = DB_URL_FOR_ALEMBIC.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif DB_URL_FOR_ALEMBIC.startswith("postgres://") and "asyncpg" not in DB_URL_FOR_ALEMBIC:
        DB_URL_FOR_ALEMBIC = DB_URL_FOR_ALEMBIC.replace("postgres://", "postgresql+asyncpg://", 1)


# Debugging prints (you can remove these once it's working)
print(f"DEBUG (env.py): settings.DATABASE_URL initial: {db_url_from_settings}")
print(f"DEBUG (env.py): Final DB_URL_FOR_ALEMBIC used: {DB_URL_FOR_ALEMBIC}")
# --- END MODIFIED BLOCK ---


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    # For offline mode, Alembic uses the URL directly from the config object,
    # which is set up to read from alembic.ini.
    # The `url` variable here is local to this function.
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    # This function is called by run_async_migrations with an active connection
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        url=DB_URL_FOR_ALEMBIC # <-- MODIFIED: Use the determined and formatted URL
    )

    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # This is the entry point for online migrations, which calls the async function.
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()