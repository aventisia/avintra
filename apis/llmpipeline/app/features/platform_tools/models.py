"""Read-only mappings for the shared library catalog tables.

The pipeline only reads these tables to resolve the platform tools a tenant has
switched on. There are no migrations, no ``create_all``, and no writes: the
Workspace APIs remain the only writer of both tables.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class PlatformToolsBase(DeclarativeBase):
    """Base class for the library catalog read mappings in the Workspace DB."""


class PlatformTool(PlatformToolsBase):
    """A library tool shared by every tenant (ai_PlatformTools)."""

    __tablename__ = "ai_PlatformTools"

    id: Mapped[uuid.UUID] = mapped_column(
        "Id",
        UUID(as_uuid=True),
        primary_key=True,
    )
    name: Mapped[str] = mapped_column(
        "Name",
        String(255),
        nullable=False,
    )
    description: Mapped[Optional[str]] = mapped_column(
        "Description",
        Text,
        nullable=True,
        default=None,
    )
    open_api_spec: Mapped[Optional[str]] = mapped_column(
        "OpenApiSpec",
        Text,
        nullable=True,
        default=None,
    )
    parsed_schema: Mapped[Optional[dict]] = mapped_column(
        "ParsedSchema",
        JSONB,
        nullable=True,
        default=None,
    )
    is_popular: Mapped[bool] = mapped_column(
        "IsPopular",
        Boolean,
        nullable=False,
        default=False,
    )
    is_disabled: Mapped[bool] = mapped_column(
        "IsDisabled",
        Boolean,
        nullable=False,
        default=False,
    )


class TenantPlatformTool(PlatformToolsBase):
    """A tenant's switch-on row for a library tool (ai_TenantPlatformTools)."""

    __tablename__ = "ai_TenantPlatformTools"

    id: Mapped[uuid.UUID] = mapped_column(
        "Id",
        UUID(as_uuid=True),
        primary_key=True,
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        "TenantId",
        UUID(as_uuid=True),
        nullable=False,
    )
    platform_tool_id: Mapped[uuid.UUID] = mapped_column(
        "PlatformToolId",
        UUID(as_uuid=True),
        nullable=False,
    )
    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        "CreatedByUserId",
        UUID(as_uuid=True),
        nullable=False,
    )
    created_on: Mapped[Optional[datetime]] = mapped_column(
        "CreatedOn",
        DateTime(timezone=True),
        nullable=True,
        default=None,
    )
