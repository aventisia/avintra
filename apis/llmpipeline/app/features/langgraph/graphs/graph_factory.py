"""Build and configure the LangGraph chat agent graph."""

import json
from typing import Any

from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.tools import BaseTool
from langgraph.graph import END, START, StateGraph
from langgraph.prebuilt import tools_condition
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.checkpoint.memory import graph_memory
from app.features.langgraph.nodes.model_node import create_model_node
from app.features.langgraph.nodes.tool_node import create_tool_node
from app.features.langgraph.schemas.graph_state import ChatState
from app.features.langgraph.schemas.skill_schema import SkillConfig
from app.features.langgraph.services.model_factory import create_chat_model
from app.features.langgraph.services.tool_skill_selector import (
    ToolSkillCatalog,
    ToolSkillSelectionResponse,
    resolve_requested_or_selected_tools_and_skills,
    select_tools_and_skills,
)
from app.features.langgraph.skills.skill_loader import load_user_skills_from_db
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.chat_agent_response_schema import (
    CHAT_AGENT_RESPONSE_SCHEMA,
)
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def build_chat_graph(
    request: LLMRequest,
    user: User,
    tool_registry: ToolRegistry,
    skill_registry: SkillRegistry,
    db_session: AsyncSession | None = None,
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

    # First step: identify required tools and skills for this request
    builder.add_node(
        "agent_selector",
        _create_agent_selector_node(
            model=planner_model,
            tool_registry=tool_registry,
            skill_registry=skill_registry,
            request=request,
            user=user,
            db_session=db_session,
            explicit_tool_names=tool_names,
            explicit_skill_names=skill_names,
        ),
    )

    builder.add_edge(START, "agent_selector")

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
        _create_dynamic_tool_node(tool_registry),
    )

    builder.add_edge("tools", "model")

    return builder.compile(checkpointer=graph_memory)


def _create_agent_selector_node(
    model: BaseChatModel,
    tool_registry: ToolRegistry,
    skill_registry: SkillRegistry,
    request: LLMRequest,
    user: User,
    db_session: AsyncSession | None = None,
    explicit_tool_names: list[str] | None = None,
    explicit_skill_names: list[str] | None = None,
):
    """
    Select tools and skills required for the current request.
    """

    tenant_id = str(user.tenant_id)

    async def identify_tools_and_skills(state: ChatState):
        metadata = state.get("metadata") or {}

        # Load tenant-specific skills from the database so the planner sees
        # both global skills and this tenant's custom skills.
        if db_session is not None:
            await load_user_skills_from_db(
                registry=skill_registry,
                db_session=db_session,
                tenant_id=tenant_id,
            )

        # Use manually provided selections when available
        if explicit_tool_names or explicit_skill_names:
            selected_tool_names = list(explicit_tool_names or [])
            selected_skill_names = list(explicit_skill_names or [])

            # Resolve skill configs against the merged tenant + global registry
            selected_skills = _resolve_skill_configs(
                skill_registry,
                selected_skill_names,
                tenant_id=tenant_id,
            )
        else:
            # Let planner model decide from the tenant-aware catalog
            selection = await select_tools_and_skills(
                request=request,
                user=user,
                tool_registry=tool_registry,
                skill_registry=skill_registry,
                tenant_id=tenant_id,
            )

            selected_tool_names = selection.tool_names
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

        node_model = model

        # Load only tools selected by agent selector
        tools = _resolve_tools(
            tool_registry,
            selected_tool_names,
        )

        # Enable tool calling when tools are available
        if tools:
            logger.info(
                "Binding selected tools: %s",
                [tool.name for tool in tools],
            )

            node_model = node_model.bind_tools(tools)

        # Inject selected skill instructions into system prompt
        skill_prompt = _build_skill_prompt(selected_skills)

        # Structured output cannot be combined with tool calling
        # because both control the model response format
        response_format = _get_response_format(llm_request)

        if response_format and not tools:
            node_model = node_model.with_structured_output(
                schema=response_format,
                method="json_schema",
                strict=True,
            )

        return await create_model_node(
            model=node_model,
            skill_prompt=skill_prompt,
        )(state)

    return model_node_factory


def _create_dynamic_tool_node(tool_registry: ToolRegistry):
    """
    Execute only the tools selected by agent selector.
    """

    async def tool_node_factory(state: ChatState):
        metadata = state.get("metadata") or {}

        selected_tool_names = metadata.get("selected_tool_names")

        # Resolve selected tool names into executable tools
        tools = tool_registry.get_by_names(selected_tool_names or [])

        return await create_tool_node(tools)(state)

    return tool_node_factory

def _resolve_tools(
    tool_registry: ToolRegistry,
    selected_tool_names: list[str] | None,
) -> list[BaseTool]:
    """Resolve selected tool names to concrete tool instances."""

    if not selected_tool_names:
        return []

    tools = tool_registry.get_by_names(selected_tool_names)
    if tools is None:
        return []

    return tools


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
    """Build a system prompt fragment describing selected skills."""

    if not skills:
        return None

    lines = [
        "You have access to the following skills for this request:",
        "",
    ]

    for skill in skills:
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
