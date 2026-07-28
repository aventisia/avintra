"""Workspace DB models for persisted LangGraph conversations and messages.

These models mirror the C# ``worc_Conversations`` / ``worc_ConversationMessages``
schema so chat threads can be stored in the Workspace database alongside the
rest of the workspace data.

The C# EF Core tables use PascalCase column names (``Id``, ``TenantId``, ...),
so each column is mapped explicitly with a ``name=`` argument. The base entity
fields from ``BaseEntity`` (CreatedByUserId, LastModifiedByUserId, LastModifiedOn,
IsDisabled) are also included because the C# table inherits them. ``Version`` is a
hidden system column managed by EF Core/Npgsql for concurrency and is **not**
persisted by SQLAlchemy.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class WorkspaceBase(DeclarativeBase):
    """Base class for Workspace database ORM models."""


class _BaseEntityMixin:
    """Columns inherited by every C# entity that derives from BaseEntity."""

    created_by_user_id: Mapped[uuid.UUID] = mapped_column(
        "CreatedByUserId",
        UUID(as_uuid=True),
        nullable=False,
        default=uuid.uuid4,
    )
    last_modified_by_user_id: Mapped[uuid.UUID] = mapped_column(
        "LastModifiedByUserId",
        UUID(as_uuid=True),
        nullable=False,
        default=uuid.uuid4,
    )
    last_modified_on: Mapped[datetime] = mapped_column(
        "LastModifiedOn",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )
    is_disabled: Mapped[bool] = mapped_column(
        "IsDisabled",
        Boolean,
        nullable=False,
        default=False,
    )


class Conversation(WorkspaceBase, _BaseEntityMixin):
    """A chat conversation linked to a flow version and a user in a tenant."""

    __tablename__ = "worc_Conversations"

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
    status: Mapped[str] = mapped_column(
        "Status",
        String(50),
        nullable=False,
        default="active",
    )
    flow_version_id: Mapped[uuid.UUID] = mapped_column(
        "FlowVersionId",
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        "UserId",
        UUID(as_uuid=True),
        nullable=False,
        index=True,
    )
    created_on: Mapped[datetime] = mapped_column(
        "CreatedOn",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    messages: Mapped[list["ConversationMessage"]] = relationship(
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="ConversationMessage.created_on",
    )


class ConversationMessage(WorkspaceBase):
    """A single message inside a persisted conversation."""

    __tablename__ = "worc_ConversationMessages"

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
    conversation_id: Mapped[uuid.UUID] = mapped_column(
        "ConversationId",
        UUID(as_uuid=True),
        ForeignKey("worc_Conversations.Id"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(
        "Role",
        String(50),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(
        "Content",
        Text,
        nullable=False,
        default="",
    )
    message_metadata: Mapped[Optional[dict]] = mapped_column(
        "Metadata",
        JSONB,
        nullable=True,
    )
    created_on: Mapped[datetime] = mapped_column(
        "CreatedOn",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    conversation: Mapped["Conversation"] = relationship(
        back_populates="messages",
    )
