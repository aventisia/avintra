# Skill retrieval utilities for augmenting direct LLM requests with skill context.
# Kept separate from the LangGraph chat path so the direct /llm/generate route
# can consume skills the same way it already consumes KB context.
from app.core.config import settings
from app.core.database import get_db_session_context
from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.graphs.graph_factory import _build_skill_prompt, _resolve_skill_configs
from app.features.langgraph.skills.skill_loader import load_user_skills_from_db
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.llm_providers.llm_kb_retrieval import _inject_context_into_input
from app.features.llm_providers.llm_providers_schemas import LLMRequest


# Module-level singleton registry for user/tenant skills.
# No default platform skills are loaded here; skills are injected only when
# explicitly requested in the payload and resolved from the Workspace DB.
_user_skill_registry: SkillRegistry | None = None


def _get_user_skill_registry() -> SkillRegistry:
    """Return a registry for tenant-scoped user skills."""
    global _user_skill_registry
    if _user_skill_registry is None:
        _user_skill_registry = SkillRegistry()
    return _user_skill_registry


async def resolve_and_inject_skill_context(llm_request: LLMRequest, user: User) -> None:
    """
    Resolve ``llm_request.skill_names`` against the tenant's user skills and
    inject a formatted skill prompt into ``llm_request.input``.

    Works like ``retrieve_and_inject_kb_context`` but for skills:
    - loads the tenant's user skills from the Workspace DB
    - resolves each requested name to a ``SkillConfig``
    - builds a prompt fragment with names, descriptions, and file contents
    - prepends the prompt into the request input

    Default platform skills are intentionally **not** loaded here; skills are
    only injected when explicitly provided in the request payload.

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
        registry = _get_user_skill_registry()

        async with get_db_session_context(settings.POSTGRESQL_WORKSPACE_DB_NAME) as session:
            await load_user_skills_from_db(
                registry=registry,
                db_session=session,
                tenant_id=tenant_id,
            )

            skill_configs = _resolve_skill_configs(
                skill_registry=registry,
                skill_names=normalized,
                tenant_id=tenant_id,
            )

        if not skill_configs:
            logger.warning(
                "[SKILL-INJECTION] None of the requested skills %s resolved for tenant %s.",
                normalized,
                tenant_id,
            )
            return

        skill_prompt = _build_skill_prompt(skill_configs)
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
