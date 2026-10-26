
"""Workspace DB models for the custom skill registry.

These models mirror the C# ``ai_Skills`` / ``ai_SkillFiles`` schema so the
Python API can read custom skills created through the .NET API. They are stored
in the Workspace database alongside other tenant-scoped orchestrator data.

The C# tables use PascalCase column names with ``TenantId`` etc., so each
column is explicitly named. ``ai_Skills`` and ``ai_SkillFiles`` are
tenant-scoped and support the tenant filtering infrastructure through
``TenantScopedMixin``.

Note:
    ``ai_SkillFiles.Content`` is stored as PostgreSQL ``text`` because the
    C# entity declares ``string Content``. The Python model maps the same
    column as ``Text`` and exposes it directly as a ``str``.
"""

import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

from app.core.database import TenantScopedMixin


class SkillRegistryBase(DeclarativeBase):
    """Base class for Skill Registry ORM models in the Workspace database."""


class _BaseEntityMixin:
    """Columns inherited by every C# entity that derives from BaseEntity."""

    created_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        "CreatedByUserId",
        UUID(as_uuid=True),
        nullable=True,
        default=None,
    )
    last_modified_by_user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        "LastModifiedByUserId",
        UUID(as_uuid=True),
        nullable=True,
        default=None,
    )
    last_modified_on: Mapped[Optional[datetime]] = mapped_column(
        "LastModifiedOn",
        DateTime(timezone=True),
        nullable=True,
        default=None,
        onupdate=lambda: datetime.now(timezone.utc),
    )
    is_disabled: Mapped[bool] = mapped_column(
        "IsDisabled",
        Boolean,
        nullable=False,
        default=False,
    )


class Skill(TenantScopedMixin, SkillRegistryBase, _BaseEntityMixin):
    """A custom or platform skill definition stored in the Workspace DB."""

    __tablename__ = "ai_Skills"

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
    space_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        "SpaceId",
        UUID(as_uuid=True),
        nullable=True,
        index=True,
    )
    env_type: Mapped[str] = mapped_column(
        "EnvType",
        String(10),
        nullable=False,
        default="Dev",
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
    is_global: Mapped[bool] = mapped_column(
        "IsGlobal",
        Boolean,
        nullable=False,
        default=False,
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
        default=True,
    )
    created_on: Mapped[datetime] = mapped_column(
        "CreatedOn",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    files: Mapped[list["SkillFile"]] = relationship(
        back_populates="skill",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        UniqueConstraint(
            "TenantId",
            "SpaceId",
            "EnvType",
            "Name",
            name="UQ_ai_Skills_TenantId_SpaceId_EnvType_Name",
        ),
    )


class SkillFile(TenantScopedMixin, SkillRegistryBase, _BaseEntityMixin):
    """A file attached to a skill (SKILL.md, scripts, README, etc.)."""

    __tablename__ = "ai_SkillFiles"

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
    skill_id: Mapped[uuid.UUID] = mapped_column(
        "SkillId",
        UUID(as_uuid=True),
        ForeignKey("ai_Skills.Id", ondelete="CASCADE"),
        nullable=False,
    )
    file_name: Mapped[str] = mapped_column(
        "FileName",
        String(255),
        nullable=False,
    )
    content: Mapped[str] = mapped_column(
        "Content",
        Text,
        nullable=False,
        default="",
    )
    file_type: Mapped[Optional[str]] = mapped_column(
        "FileType",
        String(50),
        nullable=True,
        default=None,
    )
    created_on: Mapped[datetime] = mapped_column(
        "CreatedOn",
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    skill: Mapped["Skill"] = relationship(
        back_populates="files",
    )
