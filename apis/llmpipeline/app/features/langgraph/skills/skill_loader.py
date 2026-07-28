from __future__ import annotations

import importlib
import pkgutil
from pathlib import Path
from typing import Any

import yaml

from app.core.logger import logger
from app.features.langgraph.schemas.skill_schema import SkillConfig
from app.features.langgraph.skills.skill_registry import SkillRegistry


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
        logger.info(
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
        logger.info(
            "Loading skills by explicit request: %s",
            sorted(selected_names),
        )
    else:
        selected_names = set(discovered.keys())
        logger.info(
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
