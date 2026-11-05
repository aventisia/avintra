import json
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.schemas.skill_schema import SkillConfig
from app.features.langgraph.services.model_factory import create_chat_model
from app.features.langgraph.skills.skill_loader import load_custom_skills
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.services.tool_approval import (
    APPROVAL_DENIED,
    APPROVAL_EXPIRED,
    message_approval_marker,
)
from app.features.langgraph.tools.tool_config_utils import expand_tool_config
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.llm_providers_schemas import LLMRequest
from app.features.llm_providers.services.corsair_sidecar_service import (
    fetch_corsair_schemas,
    is_corsair_tool,
    parse_corsair_tool_name,
    to_corsair_action,
)


PLANNER_SYSTEM_PROMPT = """\
You are a routing assistant. Given a user request and a catalog of available tools and skills, decide which items are relevant to satisfy the request.

Rules:
- Only select items that are actually needed to answer the request.
- If the request is a simple chat question, return empty lists.
- When the user asks to try again, retry, or continue an earlier request, select the tools or skills that were previously used for that request.
- A previous denial does not make an action irrelevant: the user approves each execution individually.
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
    conversation_messages: list[Any] | None = None,
) -> "ToolSkillSelectionResponse":
    """
    Ask a small planner LLM which tools and skills are relevant for ``request``.

    The planner receives only lightweight name/description catalogs so that full
    tool implementations and skill details are not exposed in the prompt. The
    returned selection is used to load only the required tools and to inject
    selected skills into the agent's system prompt.

    Args:
        tenant_id: When provided, the catalog includes tenant-specific custom
            skills in addition to platform skills.
        allowed_skill_names: When provided, the planner can only choose from
            these skills (e.g. the skills explicitly attached to an agent).
        allowed_tool_names: When provided, the planner can only choose from
            these tools (e.g. the actions explicitly configured on an agent).
            Corsair actions are not in the local registry, so their catalog
            entries are fetched from the sidecar.
        conversation_messages: Recent LangGraph state messages. A compact
            transcript is included so follow-up requests (e.g. "try again")
            resolve against what was asked and attempted earlier.
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
        conversation_messages=conversation_messages,
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

        raw_output = _extract_response_text(response)

        logger.debug("Tool/skill planner raw output: %s", raw_output)

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
    provided so that custom skills are available alongside platform skills.

    Args:
        request: The incoming LLM request.
        user: Authenticated user (used for tenant scoping and model creation).
        tool_registry: Registry of available tools.
        skill_registry: Registry of available skills.
        db_session: Optional async SQLAlchemy session for loading custom skills.

    Returns:
        A tuple of (selected_tool_names, selected_skill_configs).
    """

    tenant_id = str(user.tenant_id)

    if db_session is not None:
        await load_custom_skills(
            registry=skill_registry,
            db_session=db_session,
            tenant_id=tenant_id,
            env_type=user.env_type,
            space_id=user.space_id,
        )

    explicit_tools: list[str] | None = None
    explicit_skills: list[str] | None = None

    tool_config = getattr(request, "tool_config", None)
    skill_names = getattr(request, "skill_names", None)

    if tool_config:
        # Studio stores tools as { tool: "outlook", actions: [{ action: "send_email" }] }.
        # LangGraph registers one tool per action, named "<tool>_<action>".
        explicit_tools = expand_tool_config(tool_config)

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
        corsair_entries = await _build_corsair_catalog_entries(
            allowed_tool_names,
        )
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
        normalized_plugin = plugin.strip().lower()
        normalized_action = to_corsair_action(plugin, action)
        plugin_actions.setdefault(normalized_plugin, set()).add(normalized_action)

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
    conversation_messages: list[Any] | None = None,
) -> str:
    """Assemble the prompt sent to the planner LLM."""

    user_text = _extract_user_text(request)
    recent_conversation = _format_recent_messages(conversation_messages)
    recent_section = (
        "\nRecent conversation (most recent last; use it to resolve follow-up "
        "requests that reference earlier messages or tool attempts):\n"
        f"{recent_conversation}\n"
        if recent_conversation
        else ""
    )

    return f"""\
        User request:
        {user_text}
        {recent_section}
        Available tools (name and description only):
        {json.dumps(catalog.tools, indent=2)}

        Available skills (name and description only):
        {json.dumps(catalog.skills, indent=2)}

        Return the names of tools and skills that are needed to answer the user request. \
        If no tools or skills are needed, return empty lists. \
        Respond with valid JSON matching this schema:
        {json.dumps(ToolSkillSelectionResponse.model_json_schema(), indent=2)}
        """


def _format_recent_messages(
    messages: list[Any] | None,
    limit: int = 6,
    max_chars_per_message: int = 300,
) -> str:
    """Render a compact transcript of recent conversation messages.

    Gives the planner enough context to resolve follow-up requests such as
    "try again" or "and the others?" that reference an earlier tool or skill
    decision. The trailing user message is excluded because it is provided
    separately as the user request.

    Tool outcomes are paraphrased as short neutral notes instead of raw tool
    output: results can be huge, and denial instructions ("do not retry") would
    bias the relevance decision. Whether an action may run is enforced by the
    tool-approval gate, not by the planner.
    """

    if not messages:
        return ""

    recent = list(messages)
    # Drop the current user request when it is present as the latest message.
    if recent and getattr(recent[-1], "type", None) in ("human", "user"):
        recent = recent[:-1]

    lines: list[str] = []
    tool_call_names: dict[str, str] = {}

    for message in recent:
        role = (
            getattr(message, "type", None)
            or getattr(message, "role", None)
            or "unknown"
        )

        # Track tool-call ids so tool results can name their originating tool.
        for call in getattr(message, "tool_calls", None) or []:
            if isinstance(call, dict) and call.get("id"):
                tool_call_names[str(call["id"])] = str(call.get("name") or "")

        if role in ("tool", "tool_result"):
            # Paraphrase outcomes neutrally: raw output is often huge, and
            # mentioning a denial biases the planner away from re-selecting an
            # action the user may now be asking to retry. Approval consent is
            # enforced by the tool-approval gate, not by the planner.
            name = getattr(message, "name", None) or tool_call_names.get(
                str(getattr(message, "tool_call_id", "") or ""), ""
            )
            if message_approval_marker(message) in (APPROVAL_DENIED, APPROVAL_EXPIRED):
                outcome = "was requested earlier and did not complete"
            else:
                outcome = "ran earlier"
            label = f"{name} " if name else "An earlier action "
            lines.append(f"tool: {label}{outcome}")
            continue

        if role not in ("human", "user", "ai", "assistant"):
            continue

        content = getattr(message, "content", "")
        if isinstance(content, list):
            content = " ".join(str(part) for part in content)
        text = " ".join(str(content or "").split())

        # Knowledge-base context is injected as a user message; it is retrieval
        # payload, not conversation, and only adds noise for the planner.
        if "[Knowledge Base Context]" in text:
            continue

        # Assistant tool-call messages carry no text; surface the called tools.
        tool_calls = getattr(message, "tool_calls", None) or []
        if role == "ai" and tool_calls:
            names = ", ".join(
                str(call.get("name") or "")
                for call in tool_calls
                if isinstance(call, dict)
            )
            text = f"(requested tool call: {names}) {text}".strip()

        if not text:
            continue

        if len(text) > max_chars_per_message:
            text = text[:max_chars_per_message] + "…"

        role_label = {"human": "user", "ai": "assistant"}.get(role, role)
        lines.append(f"{role_label}: {text}")

    return "\n".join(lines[-limit:])


def _extract_user_text(request: LLMRequest) -> str:
    """Extract the latest user text from the request for the planner prompt."""

    if isinstance(request.input, str):
        return request.input

    if isinstance(request.input, list):
        for message in reversed(request.input):
            if getattr(message, "role", None) == "user":
                return getattr(message, "content", "")

    return ""


def _coerce_name_list(value: Any) -> list[str]:
    """Normalize a planner field into a list of names.

    The planner is asked for arrays, but a weak model may return a bare
    string or ``null``; coerce both into a list so validation can run.
    """

    if value is None:
        return []
    if isinstance(value, str):
        return [value]
    if isinstance(value, (list, tuple, set)):
        return [str(item) for item in value]
    return [str(value)]


def _extract_response_text(response: Any) -> str:
    """Return the plain-text payload of a chat model response.

    Providers shape ``AIMessage.content`` differently: most return a string, but
    Gemini 3 returns a list of content blocks (e.g.
    ``[{"type": "text", "text": "..."}]``). Stringifying that list yields a
    Python repr (single quotes, ``extras`` metadata) which is not valid JSON, so
    the planner parse would fail and fall back to selecting every skill and no
    tools. Concatenate the text blocks instead. ``response`` may also already be
    a raw dict when ``with_structured_output`` is used.
    """

    if isinstance(response, dict):
        return json.dumps(response)

    content = getattr(response, "content", response)

    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []
        for part in content:
            if isinstance(part, dict):
                text = part.get("text")
                if isinstance(text, str):
                    parts.append(text)
            elif isinstance(part, str):
                parts.append(part)
        return "".join(parts)

    return str(content)


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

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        # Some models prepend/append prose around the JSON object. Recover the
        # outermost ``{...}`` span before giving up so a stray sentence does not
        # trigger the "select everything / no tools" fallback.
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end <= start:
            raise
        data = json.loads(cleaned[start : end + 1])

    if not isinstance(data, dict):
        raise ValueError(
            f"Planner returned {type(data).__name__}, expected a JSON object."
        )

    # The planner prompt shows the response schema, and weaker models echo its
    # top-level "type": "object" (or add other keys). Read only the fields we
    # understand instead of splatting the whole object into the constructor.
    if "tool_names" not in data and "skill_names" not in data:
        raise ValueError(
            f"Planner response missing tool_names/skill_names: {sorted(data)}"
        )

    return ToolSkillSelectionResponse(
        tool_names=_coerce_name_list(data.get("tool_names")),
        skill_names=_coerce_name_list(data.get("skill_names")),
    )


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
