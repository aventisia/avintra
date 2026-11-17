# Skill retrieval utilities for augmenting direct LLM requests with skill context.
# Kept separate from the LangGraph chat path so the direct /llm/generate route
# can consume skills the same way it already consumes KB context.
from app.core.config import settings
from app.core.database import get_db_session_context
from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.skills.skill_loader import (
    build_skill_prompt,
    resolve_skill_configs,
)
from app.features.langgraph.skills.skill_loader import load_custom_skills, load_platform_skills
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.llm_providers.llm_kb_retrieval import _inject_context_into_input
from app.features.llm_providers.llm_providers_schemas import LLMRequest


# Module-level singleton registry for custom/tenant skills.
# Tenant custom skills are resolved first; a requested name that is not a custom
# skill falls back to the platform skill registry. Skills are injected only when
# explicitly requested in the payload.
_custom_skill_registry: SkillRegistry | None = None


def _get_custom_skill_registry() -> SkillRegistry:
    """Return a registry for tenant-scoped custom skills."""
    global _custom_skill_registry
    if _custom_skill_registry is None:
        _custom_skill_registry = SkillRegistry()
    return _custom_skill_registry


async def resolve_and_inject_skill_context(llm_request: LLMRequest, user: User) -> None:
    """
    Resolve ``llm_request.skill_names`` against the tenant's custom skills and
    inject a formatted skill prompt into ``llm_request.input``.

    Works like ``retrieve_and_inject_kb_context`` but for skills:
    - loads the tenant's custom skills from the Workspace DB
    - falls back to the platform skill registry for names that are not custom
    - resolves each requested name to a ``SkillConfig``
    - builds a prompt fragment with names, descriptions, and file contents
    - prepends the prompt into the request input

    Custom skills take precedence: a name already resolved from the tenant's
    custom skills is never replaced by a platform skill. Unknown names keep the
    existing warning-and-skip behaviour.

    Silently skips on any error so that a skill-resolution failure does not
    block the underlying LLM call.
    """
    skill_names = llm_request.skill_names
    if not skill_names:
        return

    normalized = [name.strip() for name in skill_names if (name or "").strip()]
    if not normalized:
        return

    tenant_id = str(user.tenant_id)

    try:
        registry = _get_custom_skill_registry()

        async with get_db_session_context(settings.POSTGRESQL_WORKSPACE_DB_NAME) as session:
            await load_custom_skills(
                registry=registry,
                db_session=session,
                tenant_id=tenant_id,
                env_type=user.env_type,
                space_id=user.space_id,
            )

        unresolved_names = [
            name for name in normalized if registry.get_for_tenant(name, tenant_id) is None
        ]
        if unresolved_names:
            load_platform_skills(registry=registry, skill_names=unresolved_names)

        skill_configs = resolve_skill_configs(
            registry,
            normalized,
            tenant_id,
        )

        if not skill_configs:
            logger.warning(
                "[SKILL-INJECTION] None of the requested skills %s resolved for tenant %s.",
                normalized,
                tenant_id,
            )
            return

        skill_prompt = build_skill_prompt(skill_configs)
        if not skill_prompt:
            return

        context_str = f"[Skill Context]\n{skill_prompt}\n[/Skill Context]"
        _inject_context_into_input(llm_request, context_str)

        logger.debug(
            "[SKILL-INJECTION] Injected context for %d skill(s): %s",
            len(skill_configs),
            [skill.name for skill in skill_configs],
        )
    except Exception as exc:
        logger.warning(
            "[SKILL-INJECTION] Failed to inject skill context: %s — continuing without skill context.",
            exc,
        )
