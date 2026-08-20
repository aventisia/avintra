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
    """

    catalog = _build_catalog(
        tool_registry=tool_registry,
        skill_registry=skill_registry,
        tenant_id=tenant_id,
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
        logger.info(
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

    logger.info(
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


def _expand_tool_config(tool_config: list[Any]) -> list[str]:
    """Expand Studio tool config entries into LangGraph tool names.

    Studio format: { tool: "outlook", actions: [{ action: "send_email" }] }
    LangGraph name: "outlook_send_email"
    """
    names: list[str] = []
    for config in tool_config:
        tool = getattr(config, "tool", None) or config.get("tool", "")
        actions = getattr(config, "actions", None) or config.get("actions", [])
        for action in actions:
            action_name = getattr(action, "action", None) or action.get("action", "")
            if tool and action_name:
                names.append(f"{tool}_{action_name}")
        if not actions and tool:
            names.append(tool)
    return names


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


def _build_catalog(
    tool_registry: ToolRegistry,
    skill_registry: SkillRegistry,
    tenant_id: str | None = None,
) -> "ToolSkillCatalog":
    """Build a name/description catalog from the live registries."""

    tools = [
        {
            "name": tool.name,
            "description": getattr(tool, "description", "") or "",
        }
        for tool in tool_registry.get_all()
    ]

    skills = [
        {
            "name": skill.name,
            "description": skill.description or "",
        }
        for skill in skill_registry.get_active_for_tenant(tenant_id)
    ]

    return ToolSkillCatalog(tools=tools, skills=skills)


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
    """Return every registered tool and skill when the planner fails."""

    return ToolSkillSelectionResponse(
        tool_names=[tool["name"] for tool in catalog.tools],
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

