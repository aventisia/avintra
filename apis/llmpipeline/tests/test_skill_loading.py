"""Regression tests for platform skill loading, companions, and tenant isolation.

Run from ``apis/llmpipeline``:

    ./venv/bin/python -m pytest tests/test_skill_loading.py -q
"""

from app.features.langgraph.schemas.skill_schema import SkillConfig
from app.features.langgraph.skills.skill_loader import (
    build_skill_prompt,
    expand_required_skill_names,
    load_platform_skills,
    resolve_skill_configs,
)
from app.features.langgraph.skills.skill_registry import SkillRegistry


UI_SKILLS = [
    "ui-design-system",
    "ui-page-archetypes",
    "ui-data-viz",
    "ui-visual-review",
    "ui-a11y-review",
]


def _platform_registry() -> SkillRegistry:
    registry = SkillRegistry()
    load_platform_skills(registry, UI_SKILLS)
    return registry


def test_archetypes_pull_in_design_system_and_a11y():
    names = expand_required_skill_names(_platform_registry(), ["ui-page-archetypes"])
    assert names == ["ui-page-archetypes", "ui-design-system", "ui-a11y-review"]


def test_expansion_keeps_order_without_duplicates():
    names = expand_required_skill_names(
        _platform_registry(),
        ["ui-design-system", "ui-data-viz", "ui-page-archetypes"],
    )
    assert names == [
        "ui-design-system",
        "ui-data-viz",
        "ui-page-archetypes",
        "ui-a11y-review",
    ]


def test_unknown_skill_passes_through_unexpanded():
    assert expand_required_skill_names(_platform_registry(), ["missing"]) == ["missing"]


def test_design_system_description_covers_customer_facing_pages():
    skill = _platform_registry().get("ui-design-system")
    assert "internal business tools" not in skill.description
    assert "HTML page" in skill.description
    assert "customer-facing forms" in skill.description


def test_skill_prompt_injects_platform_skill_body():
    registry = _platform_registry()
    configs = resolve_skill_configs(registry, ["ui-design-system"])
    prompt = build_skill_prompt(configs)
    assert "--- SKILL.md ---" in prompt
    assert "## Self-contained HTML pages" in prompt


def test_skill_prompt_injects_body_after_checkpoint_round_trip():
    configs = resolve_skill_configs(_platform_registry(), ["ui-a11y-review"])
    as_state = [config.model_dump() for config in configs]
    for entry in as_state:
        entry["metadata"].pop("files", None)
    prompt = build_skill_prompt(as_state)
    assert "## Checklist" in prompt


def test_tenant_skill_is_invisible_to_other_tenants():
    registry = _platform_registry()
    override = SkillConfig(name="ui-design-system", description="tenant copy")
    registry.replace_tenant_skills("tenant-a", [override])

    assert registry.get_for_tenant("ui-design-system", "tenant-a").description == "tenant copy"
    assert registry.get_for_tenant("ui-design-system", "tenant-b").description != "tenant copy"
    assert registry.get("ui-design-system").description != "tenant copy"


def test_reload_drops_skills_no_longer_active():
    registry = SkillRegistry()
    registry.replace_tenant_skills(
        "tenant-a", [SkillConfig(name="old", description="d")]
    )
    registry.replace_tenant_skills("tenant-a", [])
    assert registry.get_for_tenant("old", "tenant-a") is None
