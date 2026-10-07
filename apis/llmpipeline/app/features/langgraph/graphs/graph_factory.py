"""Build and configure the LangGraph chat agent graph."""

import json
from typing import Any

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.tools import BaseTool
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import tools_condition

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.checkpoint.memory import graph_memory
from app.features.langgraph.nodes.model_node import create_model_node
from app.features.langgraph.nodes.tool_node import create_tool_node
from app.features.langgraph.schemas.graph_state import ChatState
from app.features.langgraph.schemas.skill_schema import SkillConfig
from app.features.langgraph.services.model_factory import create_chat_model
from app.features.langgraph.services.request_context import restore_request
from app.features.langgraph.services.tool_approval import (
    APPROVAL_DENIED,
    message_approval_marker,
)
from app.features.langgraph.services.tool_skill_selector import (
    select_tools_and_skills,
)
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.services.corsair_sidecar_service import is_corsair_tool
from app.features.llm_providers.chat_agent_response_schema import (
    CHAT_AGENT_RESPONSE_SCHEMA,
)
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def build_chat_graph(
    request: LLMRequest,
    user: User,
    tool_registry: ToolRegistry,
    skill_registry: SkillRegistry,
    tool_names: list[str] | None = None,
    skill_names: list[str] | None = None,
) -> StateGraph:
    """
    Compile a chat LangGraph for a single request.

    Flow:
        START -> agent_selector -> model -> tools -> model -> END
    """

    # Create separate models:
    # - planner_model selects tools/skills
    # - model handles the actual conversation
    planner_model = create_chat_model(llm_request=request, user=user)
    model = create_chat_model(llm_request=request, user=user)

    builder = StateGraph(ChatState)

    # Seed the graph state with the original request and authenticated user
    # so downstream nodes (especially the tool executor) can access
    # credential/configuration details without closing over mutable objects.
    builder.add_node(
        "seed_request",
        _create_seed_request_node(request, user),
    )
    builder.add_edge(START, "seed_request")

    # First step: identify required tools and skills for this request
    builder.add_node(
        "agent_selector",
        _create_agent_selector_node(
            model=planner_model,
            tool_registry=tool_registry,
            skill_registry=skill_registry,
            request=request,
            user=user,
            explicit_tool_names=tool_names,
            explicit_skill_names=skill_names,
        ),
    )

    builder.add_edge("seed_request", "agent_selector")

    # Model node dynamically binds selected tools and skills
    builder.add_node(
        "model",
        _create_dynamic_model_node(
            model=model,
            tool_registry=tool_registry,
            llm_request=request,
        ),
    )

    builder.add_edge("agent_selector", "model")

    # Decide whether to execute tools or finish response
    builder.add_conditional_edges(
        "model",
        tools_condition,
        {
            "tools": "tools",
            "__end__": END,
        },
    )

    # Execute selected tools and return result back to model
    builder.add_node(
        "tools",
        _create_dynamic_tool_node(tool_registry, request),
    )

    builder.add_edge("tools", "model")

    return builder.compile(checkpointer=graph_memory)


def _create_seed_request_node(request: LLMRequest, user: User):
    """Write the original request and user into graph state metadata.

    The compiled graph is cached per conversation, so the request captured at
    build time goes stale after the first turn. ChatService passes the current
    request/user in the invocation input; prefer those and fall back to the
    build-time values (e.g. for resumptions without new input).
    """

    async def seed_request(state: ChatState):
        metadata = state.get("metadata") or {}
        # The merge_metadata reducer keeps other keys; this node owns only
        # request/user and prefers the per-invocation seed over build-time.
        return {
            "metadata": {
                "request": metadata.get("request") or request,
                "user": metadata.get("user") or user,
            }
        }

    return seed_request


def _create_agent_selector_node(
    model: BaseChatModel,
    tool_registry: ToolRegistry,
    skill_registry: SkillRegistry,
    request: LLMRequest,
    user: User,
    explicit_tool_names: list[str] | None = None,
    explicit_skill_names: list[str] | None = None,
):
    """
    Select tools and skills required for the current request.
    """

    tenant_id = str(user.tenant_id)

    async def identify_tools_and_skills(state: ChatState):
        metadata = state.get("metadata") or {}
        current_request = restore_request(metadata, request)

        # Explicitly configured tools (via "Configure Tools") are the only tools
        # the agent may call. They are NOT force-bound: the ReAct planner decides
        # per-message which configured actions are relevant (Path B), so a pure
        # text/drafting request binds and executes nothing. Explicitly attached
        # skills follow the same per-message routing.
        configured_tool_names = list(explicit_tool_names or [])
        configured_tool_set = set(configured_tool_names)

        if explicit_skill_names:
            logger.debug(
                "Attached skills available for planner routing: %s",
                explicit_skill_names,
            )

        # Let the ReAct planner decide which tools and skills are relevant for
        # this specific user message.
        selection = await select_tools_and_skills(
            request=current_request,
            user=user,
            tool_registry=tool_registry,
            skill_registry=skill_registry,
            tenant_id=tenant_id,
            allowed_skill_names=list(explicit_skill_names or []),
            allowed_tool_names=configured_tool_names,
            conversation_messages=state.get("messages"),
        )

        # Bind only configured actions the planner flagged as relevant. When
        # the planner selects none (e.g. writing/drafting), no tool is bound.
        selected_tool_names = [
            name for name in selection.tool_names if name in configured_tool_set
        ]

        selected_skill_names = selection.skill_names
        selected_skills = _resolve_skill_configs(
            skill_registry,
            selected_skill_names,
            tenant_id=tenant_id,
        )

        logger.info(
            "Agent identified tools/skills. tools=%s skills=%s",
            selected_tool_names,
            [skill.name for skill in selected_skills]
            if selected_skills else None,
        )

        # Store selected capabilities for later graph nodes
        return {
            "metadata": {
                **metadata,
                "selected_tool_names": selected_tool_names or None,
                "selected_skills": selected_skills,
            }
        }

    return identify_tools_and_skills


def _create_dynamic_model_node(
    model: BaseChatModel,
    tool_registry: ToolRegistry,
    llm_request: LLMRequest,
):
    """
    Create model node with runtime tool binding.
    """

    async def model_node_factory(state: ChatState):
        metadata = state.get("metadata") or {}

        selected_tool_names = metadata.get("selected_tool_names")
        selected_skills = metadata.get("selected_skills")
        # Prefer the request seeded for this turn; the closure request is the
        # graph-build-time request and goes stale in cached conversations.
        current_request = restore_request(metadata, llm_request)

        node_model = model

        # Load only tools selected by agent selector
        tools = await _resolve_tools(
            tool_registry,
            selected_tool_names,
            current_request,
        )

        # Enable tool calling when tools are available
        if tools:
            logger.debug(
                "Binding selected tools: %s",
                [tool.name for tool in tools],
            )

            node_model = node_model.bind_tools(tools)

        # Inject selected skill instructions into system prompt
        skill_prompt = _build_skill_prompt(selected_skills)

        # When a knowledge base is configured, add a directive that tells the
        # model to ground its answer in the injected "[Knowledge Base Context]"
        # block. This is independent of skill selection so the agent reliably
        # uses retrieved KB content even when no skill is applied.
        kb_directive = _build_kb_directive(current_request)
        if kb_directive:
            if skill_prompt:
                skill_prompt = f"{kb_directive}\n\n{skill_prompt}"
            else:
                skill_prompt = kb_directive

        # When tools are bound, add a strong instruction that the model must
        # actually call them for matching requests rather than simulating the
        # action or apologizing.
        tool_instruction = _build_tool_instruction(tools)
        if tool_instruction:
            if skill_prompt:
                skill_prompt = f"{tool_instruction}\n\n{skill_prompt}"
            else:
                skill_prompt = tool_instruction

        # A denial recorded earlier in the conversation otherwise makes the
        # model refuse to act even when the user explicitly asks again. When
        # the user re-requests an action they previously denied, tell the model
        # to call it; approval is requested again at execution time.
        retry_instruction = _build_denied_retry_instruction(
            state.get("messages"),
            tools,
        )
        if retry_instruction:
            if skill_prompt:
                skill_prompt = f"{retry_instruction}\n\n{skill_prompt}"
            else:
                skill_prompt = retry_instruction

        # Structured output cannot be combined with tool calling
        # because both control the model response format
        response_format = _get_response_format(current_request)

        if response_format and not tools:
            node_model = node_model.with_structured_output(
                schema=response_format,
                method="json_schema",
                strict=True,
            )

        return await create_model_node(
            model=node_model,
            skill_prompt=skill_prompt,
            max_short_term_turns=current_request.max_short_term_turns,
        )(state)

    return model_node_factory


def _create_dynamic_tool_node(tool_registry: ToolRegistry, request: LLMRequest):
    """
    Execute only the tools selected by agent selector.
    """

    async def tool_node_factory(state: ChatState):
        metadata = state.get("metadata") or {}

        selected_tool_names = metadata.get("selected_tool_names")
        # Credential/config lookups must use the current turn's request, not the
        # graph-build-time request captured in the closure.
        current_request = restore_request(metadata, request)

        # Resolve selected tool names into executable tools
        tools = await _resolve_tools(
            tool_registry,
            selected_tool_names or [],
            current_request,
        )

        return await create_tool_node(tools, current_request)(state)

    return tool_node_factory

async def _resolve_tools(
    tool_registry: ToolRegistry,
    selected_tool_names: list[str] | None,
    llm_request: LLMRequest | None = None,
) -> list[BaseTool]:
    """Resolve selected tool names to concrete tool instances."""

    if not selected_tool_names:
        return []

    legacy_names = [name for name in selected_tool_names if not is_corsair_tool(name)]
    corsair_names = [name for name in selected_tool_names if is_corsair_tool(name)]

    tools = []
    if legacy_names:
        resolved_legacy = tool_registry.get_by_names(legacy_names)
        if resolved_legacy:
            tools.extend(resolved_legacy)

    if corsair_names and llm_request is not None:
        corsair_tools = await _build_corsair_tools_for_names(corsair_names, llm_request)
        tools.extend(corsair_tools)

    return tools


async def _build_corsair_tools_for_names(
    tool_names: list[str],
    llm_request: LLMRequest,
) -> list[BaseTool]:
    """Fetch sidecar schemas and build bindable Corsair tools.

    Only actions that are explicitly allowed by ``llm_request.tool_config``
    are fetched so the model cannot call unconfigured Corsair actions.
    """
    from app.features.langgraph.tools.corsair.corsair_tool_factory import (
        build_corsair_tools_from_schemas,
    )
    from app.features.llm_providers.services.corsair_sidecar_service import (
        fetch_corsair_schemas,
        parse_corsair_tool_name,
        to_corsair_action,
    )

    configs = llm_request.tool_config or []
    allowed: dict[str, set[str]] = {}
    for config in configs:
        if isinstance(config, dict):
            tool = config.get("tool", "")
            actions = {a.get("action", "") for a in config.get("actions", [])}
        else:
            tool = config.tool
            actions = {a.action for a in config.actions}
        plugin = (tool or "").strip().lower()
        allowed.setdefault(plugin, set()).update(
            to_corsair_action(plugin, action) for action in actions if action
        )

    fetch_configs = []
    wanted: set[str] = set()
    for name in tool_names:
        plugin, action = parse_corsair_tool_name(name)
        plugin = plugin.strip().lower()
        action = to_corsair_action(plugin, action)
        wanted.add(f"{plugin}.{action}")

        if action in allowed.get(plugin, set()):
            fetch_configs.append({"tool": plugin, "actions": [{"action": action}]})
        else:
            logger.warning(
                "Skipping unconfigured Corsair tool %s (plugin=%s action=%s)",
                name,
                plugin,
                action,
            )

    if not fetch_configs:
        return []

    try:
        schemas = await fetch_corsair_schemas(fetch_configs)
    except Exception:
        logger.exception("Failed to fetch Corsair schemas for tool binding")
        return []

    # Filter schemas to only the requested names so the returned list is tight.
    schemas = [s for s in schemas if s.get("name") in wanted]

    return build_corsair_tools_from_schemas(schemas)


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


def _build_skill_prompt(skills: list[SkillConfig] | None) -> str | None:
    """Build a system prompt fragment describing selected skills.

    Skills are stored in graph state and survive checkpoint round-trips as
    plain dicts, so each entry is normalized back to ``SkillConfig`` before
    use (approval resumes re-enter the model node without the selector node).
    """

    if not skills:
        return None

    normalized: list[SkillConfig] = []
    for raw in skills:
        if isinstance(raw, SkillConfig):
            normalized.append(raw)
            continue
        if isinstance(raw, dict):
            try:
                normalized.append(SkillConfig(**raw))
            except Exception:
                logger.warning(
                    "Skipping unreadable skill from graph state: %s",
                    raw.get("name"),
                )
    if not normalized:
        return None

    lines = [
        "You have access to the following skills for this request:",
        "",
    ]

    for skill in normalized:
        lines.append(f"- {skill.name}: {skill.description}")

        # If the skill was loaded from the DB, inject the full file contents
        # (SKILL.md instructions + supporting scripts) into the prompt.
        skill_files = skill.metadata.get("files")
        if skill_files:
            lines.append("")
            lines.append(f"  Files for {skill.name}:")
            for file_info in skill_files:
                content = file_info.get("content")
                if content:
                    lines.append("")
                    lines.append(f"  --- {file_info.get('file_name')} ---")
                    lines.append(content)

    lines.append("")
    lines.append(
        "Use these skills when they are relevant to the user's request. "
        "Only reference skills from the list above."
    )

    return "\n".join(lines)


def _build_kb_directive(llm_request: LLMRequest) -> str | None:
    """Return a system instruction to ground answers in injected KB context.

    When one or more knowledge bases are configured (``kb_names``), the route
    injects a ``[Knowledge Base Context]`` block into the request input. This
    directive tells the model to use that context for fact-based questions.
    It is applied independently of skill selection so the agent reliably uses
    retrieved KB content even when no skill is triggered.
    """

    if not llm_request.kb_names:
        return None

    return (
        "A [Knowledge Base Context] block may be present in the conversation. "
        "Use it as the authoritative source of company-specific facts and policy "
        "information. When the user asks a factual or policy question, base your "
        "answer on the retrieved context. If the context does not contain the "
        "answer, say so rather than inventing information. Keep answers helpful "
        "and concise."
    )


def _build_tool_instruction(tools: list[BaseTool]) -> str | None:
    """Return a system instruction that guides the model to use bound tools."""

    if not tools:
        return None

    descriptions = []
    for tool in tools:
        desc = getattr(tool, "description", "") or ""
        # Preserve first sentence only to keep prompt concise.
        first_sentence = desc.split(".")[0].strip() if desc else ""
        if first_sentence:
            descriptions.append(f"- {tool.name}: {first_sentence}.")
        else:
            descriptions.append(f"- {tool.name}")

    return (
        "You have access to the following tools:\n"
        + "\n".join(descriptions)
        + "\n\n"
        "Call a tool only when the user explicitly requests that exact action. "
        "If the request can be answered with text (writing, drafting, rewriting, "
        "explaining, summarizing, or general questions), do not call any tool. "
        "Never call a tool to explore or verify. Do not claim you are unable to "
        "perform an action that a tool supports; call the tool."
    )


def _build_denied_retry_instruction(
    messages: list[Any] | None,
    tools: list[BaseTool],
) -> str | None:
    """Return an instruction to re-call tools the user previously denied.

    Denials stay in the conversation history, which otherwise makes the model
    refuse to act when the user explicitly asks for the action again. The
    directive only applies at the start of a new user turn: on post-tool
    continuations the tool has already run (or the denial was just delivered)
    and re-calling it would be wrong.
    """

    if not messages or not tools:
        return None

    # Only nudge on a fresh user turn (the latest message is the user request).
    if getattr(messages[-1], "type", None) != "human":
        return None

    denied_names = {
        str(getattr(message, "name", "") or "")
        for message in messages[:-1]
        if getattr(message, "type", None) == "tool"
        and message_approval_marker(message) == APPROVAL_DENIED
    }
    if not denied_names:
        return None

    # Model-facing Corsair names are sanitized (dots -> underscores); compare
    # on both forms so bound tools match their denial records.
    retry_names = [
        tool.name
        for tool in tools
        if tool.name in denied_names or tool.name.replace(".", "_") in denied_names
    ]
    if not retry_names:
        return None

    return (
        "Earlier in this conversation the user denied approval for: "
        + ", ".join(retry_names)
        + ". They have now asked for that action again. Call the tool again; "
        "the user will be asked to approve it."
    )


def _get_response_format(llm_request: LLMRequest) -> dict[str, Any] | None:
    """Return the JSON schema to use for structured output, if any."""

    if llm_request.is_chat_agent and llm_request.generate_followup_messages:
        schema = CHAT_AGENT_RESPONSE_SCHEMA

    elif llm_request.is_json_output:
        if llm_request.json_schema is None:
            raise ValueError(
                "JSON output requested but no JSON schema was provided."
            )

        schema = (
            json.loads(llm_request.json_schema)
            if isinstance(llm_request.json_schema, str)
            else llm_request.json_schema
        )

    else:
        return None

    schema.setdefault("title", "StructuredResponse")

    return schema
