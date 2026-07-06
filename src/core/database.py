from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text, inspect

from core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(migrate_missing_columns)


def migrate_missing_columns(conn):
    inspector = inspect(conn)
    for table_name, table in Base.metadata.tables.items():
        if not inspector.has_table(table_name):
            continue
        existing_columns = {col['name'] for col in inspector.get_columns(table_name)}
        for column in table.columns:
            if column.name not in existing_columns:
                col_type = column.type.compile(dialect=conn.dialect)
                nullable = "NULL" if column.nullable else "NOT NULL"
                default = ""
                if column.default is not None and hasattr(column.default, 'arg'):
                    default = f" DEFAULT {column.default.arg}"
                sql = f'ALTER TABLE {table_name} ADD COLUMN {column.name} {col_type} {nullable}{default}'
                try:
                    conn.execute(text(sql))
                    print(f"Added column {table_name}.{column.name}")
                except Exception as e:
                    print(f"Failed to add {table_name}.{column.name}: {e}")
