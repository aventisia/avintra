import json
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.schemas.skill_schema import SkillConfig
from app.features.langgraph.services.model_factory import create_chat_model
from app.features.langgraph.skills.skill_loader import load_user_skills_from_db
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.llm_providers_schemas import LLMRequest
from app.features.llm_providers.services.corsair_sidecar_service import (
    fetch_corsair_schemas,
    is_corsair_tool,
    parse_corsair_tool_name,
    to_corsair_action,
    to_corsair_tool_path,
)


PLANNER_SYSTEM_PROMPT = """\
You are a routing assistant. Given a user request and a catalog of available tools and skills, decide which items are relevant to satisfy the request.

Rules:
- Only select items that are actually needed to answer the request.
- If the request is a simple chat question, return empty lists.
- Do not invent tools or skills that are not in the catalog.
- Respond ONLY with valid JSON matching the provided schema.
"""


async def select_tools_and_skills(
    request: LLMRequest,
    user: User,
    tool_registry: ToolRegistry,
    skill_registry: SkillRegistry,
    tenant_id: str | None = None,
    allowed_skill_names: list[str] | None = None,
    allowed_tool_names: list[str] | None = None,
) -> "ToolSkillSelectionResponse":
    """
    Ask a small planner LLM which tools and skills are relevant for ``request``.

    The planner receives only lightweight name/description catalogs so that full
    tool implementations and skill details are not exposed in the prompt. The
    returned selection is used to load only the required tools and to inject
    selected skills into the agent's system prompt.

    Args:
        tenant_id: When provided, the catalog includes tenant-specific user
            skills in addition to global skills.
        allowed_skill_names: When provided, the planner can only choose from
            these skills (e.g. the skills explicitly attached to an agent).
        allowed_tool_names: When provided, the planner can only choose from
            these tools (e.g. the actions explicitly configured on an agent).
            Corsair actions are not in the local registry, so their catalog
            entries are fetched from the sidecar.
    """

    catalog = await _build_catalog(
        tool_registry=tool_registry,
        skill_registry=skill_registry,
        tenant_id=tenant_id,
        allowed_skill_names=allowed_skill_names,
        allowed_tool_names=allowed_tool_names,
    )

    if not catalog.tools and not catalog.skills:
        return ToolSkillSelectionResponse(
            tool_names=[],
            skill_names=[],
        )

    prompt = _build_planner_prompt(
        request=request,
        catalog=catalog,
    )

    planner_request = LLMRequest(
        provider=request.provider,
        model=request.model,
        input=prompt,
        ref_type=request.ref_type,
        ref_id=request.ref_id,
        ref_name=request.ref_name,
        action="ToolSkillSelection",
        agent_name=request.agent_name,
        is_json_output=True,
        json_schema=ToolSkillSelectionResponse.model_json_schema(),
        is_byok_enabled=request.is_byok_enabled,
        credential_name=request.credential_name,
        temperature=0.0,
        max_output_tokens=1024,
    )

    try:
        model = create_chat_model(
            llm_request=planner_request,
            user=user,
        )
    except Exception as exc:
        logger.warning(
            "Could not create planner model for tool/skill selection: %s. Falling back to all available items.",
            exc,
        )
        return _fallback_selection(catalog)

    try:
        response = await model.ainvoke(
            [
                SystemMessage(content=PLANNER_SYSTEM_PROMPT),
                HumanMessage(content=prompt),
            ]
        )

        # ``response`` may be a raw dict when ``with_structured_output`` is used.
        if isinstance(response, dict):
            raw_output = json.dumps(response)
        elif isinstance(response.content, str):
            raw_output = response.content
        else:
            raw_output = str(response.content)

        parsed = _parse_selection_output(raw_output)

        return _validate_selection(parsed, catalog)
    except Exception as exc:
        logger.warning(
            "Tool/skill selection failed: %s. Falling back to all available items.",
            exc,
        )
        return _fallback_selection(catalog)


async def resolve_requested_or_selected_tools_and_skills(
    request: LLMRequest,
    user: User,
    tool_registry: ToolRegistry,
    skill_registry: SkillRegistry,
    db_session: AsyncSession | None = None,
) -> tuple[list[str], list[SkillConfig]]:
    """
    Decide which tools and skills to load.

    If ``request.tool_config`` or ``request.skill_names`` are present, use those
    explicit values. Otherwise ask the planner LLM to pick relevant tools/skills
    from the lightweight catalog.

    Tenant-specific skills are loaded from the database when a session is
    provided so that custom user skills are available alongside global skills.

    Args:
        request: The incoming LLM request.
        user: Authenticated user (used for tenant scoping and model creation).
        tool_registry: Registry of available tools.
        skill_registry: Registry of available skills.
        db_session: Optional async SQLAlchemy session for loading user skills.

    Returns:
        A tuple of (selected_tool_names, selected_skill_configs).
    """

    tenant_id = str(user.tenant_id)

    if db_session is not None:
        await load_user_skills_from_db(
            registry=skill_registry,
            db_session=db_session,
            tenant_id=tenant_id,
        )

    explicit_tools: list[str] | None = None
    explicit_skills: list[str] | None = None

    tool_config = getattr(request, "tool_config", None)
    skill_names = getattr(request, "skill_names", None)

    if tool_config:
        # Studio stores tools as { tool: "outlook", actions: [{ action: "send_email" }] }.
        # LangGraph registers one tool per action, named "<tool>_<action>".
        explicit_tools = _expand_tool_config(tool_config)

    if skill_names:
        explicit_skills = skill_names

    if explicit_tools is not None or explicit_skills is not None:
        logger.debug(
            "Using explicit tool/skill selection. tools=%s skills=%s",
            explicit_tools,
            explicit_skills,
        )
        selected_skills = _resolve_skill_configs(
            skill_registry,
            explicit_skills or [],
            tenant_id=tenant_id,
        )
        return (
            explicit_tools or [],
            selected_skills,
        )

    selection = await select_tools_and_skills(
        request=request,
        user=user,
        tool_registry=tool_registry,
        skill_registry=skill_registry,
        tenant_id=tenant_id,
    )

    logger.debug(
        "Planner selected tools/skills. tools=%s skills=%s",
        selection.tool_names,
        selection.skill_names,
    )

    selected_skills = _resolve_skill_configs(
        skill_registry,
        selection.skill_names,
        tenant_id=tenant_id,
    )

    return selection.tool_names, selected_skills


def _iter_tool_config_entries(tool_config: list[Any]):
    """Yield ``(normalized_tool_name, approval)`` for every configured action.

    Naming rules (shared with ``_expand_tool_config`` and the approval map):
    - tool containing a dot → ``<tool>.<action>``
    - dotted action (Corsair operationId) → canonical ``<plugin>.api.<action>``
    - legacy action → ``<tool>_<action>``
    - entry without actions → the raw tool name
    """

    for config in tool_config:
        tool = getattr(config, "tool", None) or config.get("tool", "")
        actions = getattr(config, "actions", None) or config.get("actions", [])
        # If the tool name already contains a dot, emit dotted names directly.
        if "." in tool:
            if not actions and tool:
                yield tool, None
            for action in actions:
                action_name = getattr(action, "action", None) or action.get("action", "")
                approval = getattr(action, "approval", None) or action.get("approval", None)
                if tool and action_name:
                    yield f"{tool}.{action_name}", approval
            continue
        if not actions and tool:
            yield tool, None
        for action in actions:
            action_name = getattr(action, "action", None) or action.get("action", "")
            approval = getattr(action, "approval", None) or action.get("approval", None)
            if tool and action_name:
                # Dotted actions identify Corsair tools. Studio sends the seeded
                # OpenAPI operationId (e.g. "openai.models.list"); normalize it
                # to the canonical sidecar path (e.g. "openai.api.models.list").
                if "." in action_name:
                    yield to_corsair_tool_path(tool, action_name), approval
                else:
                    yield f"{tool}_{action_name}", approval


def _expand_tool_config(tool_config: list[Any]) -> list[str]:
    """Expand Studio tool config entries into LangGraph tool names.

    Studio format: { tool: "outlook", actions: [{ action: "send_email" }] }
    Legacy LangGraph name: "outlook_send_email"
    Corsair LangGraph name: "github.api.issues.create"

    For Corsair, the Studio ``tool`` field is the plugin root (e.g. ``github``)
    and the action is either the remaining dotted path (e.g.
    ``api.issues.create``) or the seeded OpenAPI operationId (e.g.
    ``openai.models.list``). Both are normalized to the canonical sidecar path
    ``<plugin>.api.<action>``.

    For legacy platform tools, the action is a single capability word (e.g.
    ``send_email``) and the emitted name remains ``<tool>_<action>``.
    """

    return [name for name, _ in _iter_tool_config_entries(tool_config)]


def build_tool_approval_map(tool_config: list[Any] | None) -> dict[str, str]:
    """Map normalized configured tool names to their approval policy.

    Studio sends one ``approval`` per action (``"auto"`` | ``"human"``).
    Missing or unrecognized values fail closed to ``"human"`` so an action can
    never auto-execute without an explicit ``auto`` configuration. Names are
    normalized exactly like bound tool names (see ``_expand_tool_config``).
    """

    approvals: dict[str, str] = {}
    for name, approval in _iter_tool_config_entries(tool_config or []):
        approvals[name] = (
            "auto" if str(approval).strip().lower() == "auto" else "human"
        )
    return approvals





def _resolve_skill_configs(
    skill_registry: SkillRegistry,
    skill_names: list[str],
    tenant_id: str | None = None,
) -> list[SkillConfig]:
    """Resolve a list of skill names to their registered configs."""

    configs: list[SkillConfig] = []

    for name in skill_names:
        skill = skill_registry.get_for_tenant(name, tenant_id)
        if skill is not None and skill.is_active:
            configs.append(skill)
        else:
            logger.warning(
                "Selected skill %s is not available in the registry.",
                name,
            )

    return configs


async def _build_catalog(
    tool_registry: ToolRegistry,
    skill_registry: SkillRegistry,
    tenant_id: str | None = None,
    allowed_skill_names: list[str] | None = None,
    allowed_tool_names: list[str] | None = None,
) -> "ToolSkillCatalog":
    """Build a name/description catalog from the live registries.

    When ``allowed_skill_names`` is provided the skill catalog is restricted
    to those names; an empty list restricts it to no skills. ``None`` means
    no explicit attachment context and leaves the full registry visible.

    ``allowed_tool_names`` behaves the same way for tools. Because Corsair
    actions live on the sidecar and not in the local registry, their entries
    are fetched from the sidecar for the configured actions. A sidecar failure
    omits the Corsair entries entirely so the planner cannot select them
    (fail closed).
    """

    tools = [
        {
            "name": tool.name,
            "description": getattr(tool, "description", "") or "",
        }
        for tool in tool_registry.get_all()
    ]

    if allowed_tool_names is not None:
        allowed_tools = {
            name.strip().lower()
            for name in allowed_tool_names
            if name and name.strip()
        }
        corsair_entries = await _build_corsair_catalog_entries(allowed_tool_names)
        available_tools = {tool["name"].lower() for tool in tools}
        available_tools.update(entry["name"].lower() for entry in corsair_entries)
        missing_tools = sorted(allowed_tools - available_tools)
        if missing_tools:
            logger.warning(
                "Configured tools not found in the registry or sidecar: %s",
                missing_tools,
            )
        tools = [
            tool for tool in tools if tool["name"].lower() in allowed_tools
        ] + [
            entry
            for entry in corsair_entries
            if entry["name"].lower() in allowed_tools
        ]

    skills = [
        {
            "name": skill.name,
            "description": skill.description or "",
        }
        for skill in skill_registry.get_active_for_tenant(tenant_id)
    ]

    if allowed_skill_names is not None:
        allowed = {
            name.strip().lower()
            for name in allowed_skill_names
            if name and name.strip()
        }
        available = {skill["name"].lower() for skill in skills}
        missing = sorted(allowed - available)
        if missing:
            logger.warning(
                "Attached skills not found in the registry: %s",
                missing,
            )
        skills = [
            skill for skill in skills if skill["name"].lower() in allowed
        ]

    return ToolSkillCatalog(tools=tools, skills=skills)


async def _build_corsair_catalog_entries(
    allowed_tool_names: list[str],
) -> list[dict[str, Any]]:
    """Build planner catalog entries for configured Corsair actions.

    Configured names are normalized to canonical ``<plugin>.api.<action>``
    paths, grouped per plugin, and resolved against the sidecar tool catalog
    (cached). Returns an empty list when the sidecar is unavailable so planner
    gating fails closed rather than selecting actions it cannot describe.
    """

    plugin_actions: dict[str, set[str]] = {}
    for name in allowed_tool_names:
        if not name or not is_corsair_tool(name):
            continue
        try:
            plugin, action = parse_corsair_tool_name(name)
        except ValueError:
            logger.warning("Skipping malformed Corsair tool name: %s", name)
            continue
        normalized_action = to_corsair_action(plugin, action)
        plugin_actions.setdefault(plugin.strip().lower(), set()).add(
            normalized_action
        )

    if not plugin_actions:
        return []

    fetch_configs = [
        {
            "tool": plugin,
            "actions": [{"action": action} for action in sorted(actions)],
        }
        for plugin, actions in sorted(plugin_actions.items())
    ]

    try:
        schemas = await fetch_corsair_schemas(fetch_configs)
    except Exception:
        logger.exception(
            "Failed to fetch Corsair catalog entries; omitting Corsair tools."
        )
        return []

    entries: list[dict[str, Any]] = []
    for schema in schemas:
        entry_name = schema.get("name")
        if not entry_name:
            continue
        entries.append(
            {
                "name": entry_name,
                "description": schema.get("description") or entry_name,
            }
        )

    return entries


def _build_planner_prompt(
    request: LLMRequest,
    catalog: "ToolSkillCatalog",
) -> str:
    """Assemble the prompt sent to the planner LLM."""

    user_text = _extract_user_text(request)

    return f"""\
        User request:
        {user_text}

        Available tools (name and description only):
        {json.dumps(catalog.tools, indent=2)}

        Available skills (name and description only):
        {json.dumps(catalog.skills, indent=2)}

        Return the names of tools and skills that are needed to answer the user request. \
        If no tools or skills are needed, return empty lists. \
        Respond with valid JSON matching this schema:
        {json.dumps(ToolSkillSelectionResponse.model_json_schema(), indent=2)}
        """


def _extract_user_text(request: LLMRequest) -> str:
    """Extract the latest user text from the request for the planner prompt."""

    if isinstance(request.input, str):
        return request.input

    if isinstance(request.input, list):
        for message in reversed(request.input):
            if getattr(message, "role", None) == "user":
                return getattr(message, "content", "")

    return ""


def _parse_selection_output(raw_output: str) -> "ToolSkillSelectionResponse":
    """Parse planner JSON output into a selection response."""

    # Some models wrap JSON in markdown fences; strip them.
    cleaned = raw_output.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()

    data = json.loads(cleaned)
    return ToolSkillSelectionResponse(**data)


def _validate_selection(
    parsed: "ToolSkillSelectionResponse",
    catalog: "ToolSkillCatalog",
) -> "ToolSkillSelectionResponse":
    """Drop any selected names that are not in the catalog."""

    valid_tool_names = {tool["name"] for tool in catalog.tools}
    valid_skill_names = {skill["name"] for skill in catalog.skills}

    validated_tools = [
        name
        for name in parsed.tool_names
        if name in valid_tool_names
    ]
    validated_skills = [
        name
        for name in parsed.skill_names
        if name in valid_skill_names
    ]

    if validated_tools != parsed.tool_names or validated_skills != parsed.skill_names:
        logger.warning(
            "Planner returned unknown tools/skills. tools=%s -> %s, skills=%s -> %s",
            parsed.tool_names,
            validated_tools,
            parsed.skill_names,
            validated_skills,
        )

    return ToolSkillSelectionResponse(
        tool_names=validated_tools,
        skill_names=validated_skills,
    )


def _fallback_selection(catalog: "ToolSkillCatalog") -> "ToolSkillSelectionResponse":
    """Return the planner fallback when selection fails.

    Skills keep their full allowed catalog (the model still receives skill
    instructions, which are prompt-only). Tools fall back to an empty list so
    a planner outage can never bind or execute a configured action without a
    positive relevance decision.
    """

    return ToolSkillSelectionResponse(
        tool_names=[],
        skill_names=[skill["name"] for skill in catalog.skills],
    )


# ---------------------------------------------------------------------------
# Catalog / response schemas defined here to avoid a circular schema import.
# ---------------------------------------------------------------------------

class ToolSkillCatalog:
    """Lightweight catalog entry sent to the planner LLM."""

    def __init__(
        self,
        tools: list[dict[str, Any]] | None = None,
        skills: list[dict[str, Any]] | None = None,
    ):
        self.tools = tools or []
        self.skills = skills or []


class ToolSkillSelectionResponse:
    """
    Structured selection returned by the lightweight planner LLM.

    The planner receives only tool/skill names and descriptions so it can pick
    the subset relevant to the user prompt without exposing full tool
    implementations or skill internals.
    """

    def __init__(
        self,
        tool_names: list[str] | None = None,
        skill_names: list[str] | None = None,
    ):
        self.tool_names = tool_names or []
        self.skill_names = skill_names or []

    @classmethod
    def model_json_schema(cls) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "tool_names": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Names of tools that should be loaded for this request.",
                },
                "skill_names": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Names of skills that should be available for this request.",
                },
            },
            "required": ["tool_names", "skill_names"],
        }

