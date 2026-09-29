from __future__ import annotations

import importlib
import pkgutil
from pathlib import Path
from typing import Any

import yaml
from sqlalchemy.orm import selectinload

from app.core.env_utils import normalize_env_type
from app.core.space_utils import normalize_space_id
from app.core.logger import logger
from app.features.langgraph.schemas.skill_schema import SkillConfig
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.schemas.skill_registry_models import Skill


SKILL_PACKAGE = "app.features.langgraph.skills"


def _read_skill_metadata(skill_module_name: str) -> dict[str, Any] | None:
    """
    Read and parse the YAML front-matter from a skill's ``SKILL.md``.

    Returns:
        Parsed front-matter as a dictionary, or ``None`` if the skill does
        not contain a readable ``SKILL.md``.
    """

    try:
        module = importlib.import_module(skill_module_name)
    except Exception as exc:
        logger.warning(
            "Could not import skill module %s: %s",
            skill_module_name,
            exc,
        )
        return None

    if not hasattr(module, "__file__") or module.__file__ is None:
        return None

    skill_dir = Path(module.__file__).parent
    skill_md = skill_dir / "SKILL.md"

    if not skill_md.is_file():
        logger.debug(
            "No SKILL.md found for skill %s; skipping.",
            skill_module_name,
        )
        return None

    content = skill_md.read_text(encoding="utf-8")

    if not content.startswith("---"):
        logger.warning(
            "SKILL.md for %s is missing YAML front-matter.",
            skill_module_name,
        )
        return None

    parts = content.split("---", 2)
    if len(parts) < 3:
        logger.warning(
            "Malformed front-matter in SKILL.md for %s.",
            skill_module_name,
        )
        return None

    try:
        metadata = yaml.safe_load(parts[1]) or {}
    except Exception as exc:
        logger.warning(
            "Failed to parse SKILL.md front-matter for %s: %s",
            skill_module_name,
            exc,
        )
        return None

    if not isinstance(metadata, dict):
        logger.warning(
            "Invalid front-matter format in SKILL.md for %s.",
            skill_module_name,
        )
        return None

    return metadata


def _build_skill_config(skill_module_name: str, metadata: dict[str, Any]) -> SkillConfig:
    """
    Build a ``SkillConfig`` from parsed SKILL.md front-matter.

    Only ``name`` and ``description`` are required; the rest are stored
    loosely inside ``metadata`` so that ``SKILL.md`` remains the single
    source of skill details.
    """

    name = metadata.get("name", skill_module_name.rsplit(".", 1)[-1])
    description = metadata.get("description", "")

    return SkillConfig(
        name=name,
        description=description,
        metadata={
            "module": skill_module_name,
            "tags": metadata.get("tags") or [],
            "providers": metadata.get("providers") or [],
            "license": metadata.get("license") or {},
            "references": metadata.get("references") or [],
        },
    )


def discover_skills() -> dict[str, SkillConfig]:
    """
    Discover all skill packages containing a ``SKILL.md``.

    Returns:
        A mapping from skill name to its ``SkillConfig``.
    """

    discovered: dict[str, SkillConfig] = {}

    package = importlib.import_module(SKILL_PACKAGE)
    if not hasattr(package, "__path__"):
        return discovered

    for _, skill_module_name, ispkg in pkgutil.iter_modules(package.__path__):
        if not ispkg:
            continue

        full_module_name = f"{SKILL_PACKAGE}.{skill_module_name}"
        metadata = _read_skill_metadata(full_module_name)

        if metadata is None:
            continue

        try:
            config = _build_skill_config(full_module_name, metadata)
        except Exception as exc:
            logger.warning(
                "Failed to load skill config for %s: %s",
                full_module_name,
                exc,
            )
            continue

        discovered[config.name] = config
        logger.debug(
            "Discovered skill %s from %s",
            config.name,
            full_module_name,
        )

    return discovered


def load_default_skills(
    registry: SkillRegistry,
    skill_names: list[str] | None = None,
) -> list[SkillConfig]:
    """
    Register the default set of platform skills.

    Selection priority:
        1. ``skill_names`` — if provided and non-empty, only those skills are
           loaded.
        2. All discovered skills — fallback when no explicit list is given.

    Args:
        registry: ``SkillRegistry`` instance to register skills into.
        skill_names: Optional explicit list of skill names to load.

    Returns:
        A list of registered ``SkillConfig`` instances.
    """

    discovered = discover_skills()
    selected_names: set[str]

    if skill_names:
        selected_names = set(skill_names)
        logger.debug(
            "Loading skills by explicit request: %s",
            sorted(selected_names),
        )
    else:
        selected_names = set(discovered.keys())
        logger.debug(
            "Loading all discovered default skills: %s",
            sorted(selected_names),
        )

    loaded: list[SkillConfig] = []

    for name in selected_names:
        config = discovered.get(name)

        if config is None:
            logger.warning(
                "Requested skill %s was not discovered; skipping.",
                name,
            )
            continue

        registry.register(config)
        loaded.append(config)

    return loaded


def _build_skill_config_from_db(skill: Skill) -> SkillConfig | None:
    """
    Build a ``SkillConfig`` from a database ``Skill`` row.

    The SKILL.md content is expected to be stored as one of the attached
    ``SkillFile`` rows with the file name ``SKILL.md``. Row-level values win;
    the YAML front-matter name/description act as fallbacks so that user
    skills behave identically to filesystem skills in the registry.
    """

    skill_md = next(
        (f for f in (skill.files or []) if f.file_name.lower() == "skill.md"),
        None,
    )

    metadata: dict[str, Any] = {
        "skill_id": str(skill.id),
        "tenant_id": str(skill.tenant_id),
        "files": [
            {
                "id": str(file.id),
                "file_name": file.file_name,
                "file_type": file.file_type,
            }
            for file in (skill.files or [])
        ],
    }

    tags: list[str] = []
    providers: list[str] = []
    license_block: dict[str, Any] = {}
    references: list[dict[str, Any]] = []
    frontmatter_name = ""
    frontmatter_description = ""

    if skill_md and skill_md.content:
        try:
            content = skill_md.content
            if content.startswith("---"):
                parts = content.split("---", 2)
                if len(parts) >= 3:
                    parsed = yaml.safe_load(parts[1]) or {}
                    if isinstance(parsed, dict):
                        frontmatter_name = parsed.get("name") or ""
                        frontmatter_description = parsed.get("description") or ""
                        tags = parsed.get("tags") or []
                        providers = parsed.get("providers") or []
                        license_block = parsed.get("license") or {}
                        references = parsed.get("references") or []
        except Exception as exc:
            logger.warning(
                "Failed to parse SKILL.md front-matter for skill %s (%s): %s",
                skill.name,
                skill.id,
                exc,
            )

    metadata["tags"] = tags
    metadata["providers"] = providers

    # Include decoded file contents in metadata so the runtime can inject
    # SKILL.md instructions and supporting scripts into the agent prompt.
    metadata["files"] = [
        {
            "id": str(file.id),
            "file_name": file.file_name,
            "file_type": file.file_type,
            "content": file.content,
        }
        for file in (skill.files or [])
    ]

    from app.features.langgraph.schemas.skill_schema import SkillLicense, SkillReference

    license_obj = SkillLicense(
        name=license_block.get("name", ""),
        url=license_block.get("url", ""),
        terms=license_block.get("terms", ""),
    )

    reference_objs = [
        SkillReference(
            title=ref.get("title", ""),
            url=ref.get("url", ""),
            type=ref.get("type", ""),
        )
        for ref in references
        if isinstance(ref, dict)
    ]

    return SkillConfig(
        name=skill.name or frontmatter_name,
        description=(skill.description or "").strip() or frontmatter_description,
        is_active=skill.is_active,
        metadata=metadata,
        license=license_obj,
        references=reference_objs,
        providers=providers,
    )


async def load_user_skills_from_db(
    registry: SkillRegistry,
    db_session,
    tenant_id: str,
    env_type: str | None = "dev",
    space_id: str | None = None,
) -> list[SkillConfig]:
    """
    Load active user-created skills from the Workspace DB for a tenant and env.

    Args:
        registry: ``SkillRegistry`` to register discovered user skills into.
        db_session: An async SQLAlchemy session.
        tenant_id: UUID string of the tenant whose skills should be loaded.
        env_type: Active deployment environment ("dev"/"prod"). Skills from other
            environments are excluded so Dev and Prod resolve independently.

    Returns:
        A list of user ``SkillConfig`` instances that were registered.
    """

    from sqlalchemy import case, func, select
    from uuid import UUID

    loaded: list[SkillConfig] = []
    normalized_env = normalize_env_type(env_type)
    normalized_space_id = normalize_space_id(space_id)

    try:
        tenant_uuid = UUID(tenant_id)
    except Exception as exc:
        logger.warning(
            "Invalid tenant_id for user skill loading: %s (%s)",
            tenant_id,
            exc,
        )
        return loaded

    space_order = case(
        (Skill.space_id == normalized_space_id, 0),
        (Skill.space_id.is_(None), 1),
        else_=2,
    )
    result = await db_session.execute(
        select(Skill)
        .where(Skill.tenant_id == tenant_uuid)
        .where(func.lower(Skill.env_type) == normalized_env)
        .where(Skill.is_active.is_(True))
        .where(Skill.is_disabled.is_(False))
        # Prefer the request space, then Central, then the oldest other-space row.
        .order_by(space_order, Skill.created_on.asc(), Skill.id.asc())
        .options(selectinload(Skill.files))
    )
    skills = result.unique().scalars().all()

    selected_skill_names: set[str] = set()
    for skill in skills:
        normalized_name = skill.name.casefold()
        if normalized_name in selected_skill_names:
            continue
        selected_skill_names.add(normalized_name)
        config = _build_skill_config_from_db(skill)
        if config is None:
            continue

        if registry.exists(config.name):
            logger.warning(
                "User skill %s (%s) conflicts with an existing skill; overwriting.",
                config.name,
                skill.id,
            )

        registry.register(config)
        loaded.append(config)
        logger.debug(
            "Loaded user skill %s for tenant %s",
            config.name,
            tenant_id,
        )

    return loaded
