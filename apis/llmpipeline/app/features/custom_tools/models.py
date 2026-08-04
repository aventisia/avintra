import uuid
from typing import Optional

from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from app.core.database import TenantScopedMixin


class CustomToolsBase(DeclarativeBase):
    """Base class for custom tools ORM models in the Workspace database."""


class Tool(TenantScopedMixin, CustomToolsBase):
    """A custom tool definition stored in the Workspace DB (ws_Tools table)."""

    __tablename__ = "ws_Tools"

    id: Mapped[uuid.UUID] = mapped_column(
        "Id",
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        "TenantId",
        UUID(as_uuid=True),
        nullable=False,
        index=True,
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
    type: Mapped[str] = mapped_column(
        "Type",
        String(50),
        nullable=False,
    )
    base_url: Mapped[str] = mapped_column(
        "BaseUrl",
        String(1000),
        nullable=False,
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
    authentication_type: Mapped[Optional[str]] = mapped_column(
        "AuthenticationType",
        String(50),
        nullable=True,
        default=None,
    )
    credential_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        "CredentialId",
        UUID(as_uuid=True),
        nullable=True,
        default=None,
    )
    is_tenant_wide_access: Mapped[bool] = mapped_column(
        "IsTenantWideAccess",
        Boolean,
        nullable=False,
        default=False,
    )
    is_active: Mapped[bool] = mapped_column(
        "IsActive",
        Boolean,
        nullable=False,
        default=False,
    )
    is_verified: Mapped[bool] = mapped_column(
        "IsVerified",
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

    flow_version_links: Mapped[list["FlowVersion_Tool"]] = relationship(
        back_populates="tool",
    )


class FlowVersion_Tool(TenantScopedMixin, CustomToolsBase):
    """Many-to-many join between FlowVersion and Tool."""

    __tablename__ = "FlowVersion_Tool"

    id: Mapped[uuid.UUID] = mapped_column(
        "Id",
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    tenant_id: Mapped[uuid.UUID] = mapped_column(
        "TenantId",
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )
    flow_version_id: Mapped[uuid.UUID] = mapped_column(
        "FlowVersionId",
        UUID(as_uuid=True),
        ForeignKey("FlowVersions.Id", ondelete="CASCADE"),
        nullable=False,
    )
    tool_id: Mapped[uuid.UUID] = mapped_column(
        "ToolId",
        UUID(as_uuid=True),
        ForeignKey("ws_Tools.Id", ondelete="CASCADE"),
        nullable=False,
    )
    allowed_operations: Mapped[Optional[list]] = mapped_column(
        "AllowedOperations",
        JSONB,
        nullable=True,
        default=None,
    )
    credential_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        "CredentialId",
        UUID(as_uuid=True),
        nullable=True,
        default=None,
    )

    tool: Mapped["Tool"] = relationship(back_populates="flow_version_links")
