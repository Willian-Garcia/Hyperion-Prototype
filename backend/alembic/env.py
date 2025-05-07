import os
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
from dotenv import load_dotenv

# 🔁 Carrega o .env da raiz do projeto
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# 🔧 Carrega config do alembic.ini
config = context.config

# Atualiza a URL do banco dinamicamente com base no .env
config.set_main_option(
    "sqlalchemy.url",
    f"postgresql+asyncpg://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}:{os.getenv('POSTGRES_PORT')}/{os.getenv('POSTGRES_DB')}"
)

# 🎯 Importa os modelos
from app.core.database import Base
from app.models.queimadas import CicatrizQueimada  # ou o nome dos seus modelos

# 📌 Define a metadata para gerar migrations automaticamente
target_metadata = Base.metadata

# Logging (sem mudanças)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Modo offline
def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

# Modo online
def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

# Executa o modo certo
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
