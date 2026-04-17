from collections.abc import Callable
from contextlib import asynccontextmanager
from typing import AsyncGenerator, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import event
from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Session, with_loader_criteria

from app.core.config import settings
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User

# Engines and session factories are created lazily and cached per database name.
_engines: dict[str, AsyncEngine] = {}
_session_factories: dict[str, async_sessionmaker[AsyncSession]] = {}


class TenantScopedMixin:
    """
    Marker mixin for ORM entities that must always be tenant-scoped.
    Any mapped model that should be isolated by tenant must inherit this mixin.
    """


@event.listens_for(Session, "do_orm_execute")
def _enforce_tenant_criteria(execute_state) -> None:
    """Apply tenant filtering automatically for ORM SELECTs on TenantScopedMixin models."""
    if not execute_state.is_select:
        return

    if execute_state.execution_options.get("skip_tenant_criteria", False):
        return

    tenant_id: Optional[UUID] = execute_state.session.info.get("tenant_id")
    if tenant_id is None:
        return

    execute_state.statement = execute_state.statement.options(
        with_loader_criteria(
            TenantScopedMixin,
            lambda cls: cls.tenant_id == tenant_id,
            include_aliases=True,
        )
    )


def _build_db_url(database_name: str) -> URL:
    return URL.create(
        drivername="postgresql+asyncpg",
        username=settings.POSTGRESQL_USERNAME,
        password=settings.POSTGRESQL_PASSWORD,
        host=settings.POSTGRESQL_HOST,
        port=int(settings.POSTGRESQL_PORT),
        database=database_name,
    )


def _get_engine(database_name: str) -> AsyncEngine:
    engine = _engines.get(database_name)
    if engine is None:
        engine = create_async_engine(
            _build_db_url(database_name),
            pool_pre_ping=True,
            echo=False,
        )
        _engines[database_name] = engine
    return engine


def _get_session_factory(database_name: str) -> async_sessionmaker[AsyncSession]:
    session_factory = _session_factories.get(database_name)
    if session_factory is None:
        session_factory = async_sessionmaker(
            bind=_get_engine(database_name),
            class_=AsyncSession,
            expire_on_commit=False,
            autoflush=False,
        )
        _session_factories[database_name] = session_factory
    return session_factory


def get_db_session_for(database_name: str) -> Callable[[], AsyncGenerator[AsyncSession, None]]:
    """Create a FastAPI dependency that yields a session for a fixed database name."""

    async def dependency() -> AsyncGenerator[AsyncSession, None]:
        async with _get_session_factory(database_name)() as session:
            yield session

    return dependency


async def get_db_session(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that resolves database name from `X-Database-Name` request header.
    """
    database_name = request.headers.get("X-Database-Name")
    if not database_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing required header: X-Database-Name",
        )

    async with _get_session_factory(database_name)() as session:
        yield session


class TenantDB:
    """Carries an AsyncSession plus authenticated tenant_id for tenant-scoped data access."""

    def __init__(self, session: Optional[AsyncSession], tenant_id: UUID) -> None:
        self.session = session
        self.tenant_id = tenant_id


@asynccontextmanager
async def get_db_session_context(database_name: str) -> AsyncGenerator[AsyncSession, None]:
    """Async context manager for opening a session against a specific database."""
    async with _get_session_factory(database_name)() as session:
        yield session


def get_tenant_db_session(
    user: User = Depends(authorize()),
    session: AsyncSession = Depends(get_db_session),
) -> TenantDB:
    """
    Combined dependency that authenticates user + opens DB session.
    Tenant filtering is auto-applied on ORM SELECTs for models inheriting TenantScopedMixin.
    """
    session.info["tenant_id"] = user.tenant_id
    return TenantDB(session=session, tenant_id=user.tenant_id)


def get_tenant_db_session_for(database_name: str) -> Callable[..., TenantDB]:
    """Create a dependency for a fixed database with automatic tenant criteria enabled."""

    def dependency(
        user: User = Depends(authorize()),
        session: AsyncSession = Depends(get_db_session_for(database_name)),
    ) -> TenantDB:
        session.info["tenant_id"] = user.tenant_id
        return TenantDB(session=session, tenant_id=user.tenant_id)

    return dependency


async def dispose_all_db_engines() -> None:
    """Dispose all cached SQLAlchemy engines; call from FastAPI shutdown/lifespan."""
    for engine in list(_engines.values()):
        await engine.dispose()
    _engines.clear()
    _session_factories.clear()
