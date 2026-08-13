"""Tool node that normalizes tool calls before invoking the LangGraph ToolNode."""

from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.tools import BaseTool
from langgraph.prebuilt import ToolNode

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.schemas.graph_state import ChatState
from app.features.langgraph.tools.outlook.outlook_client import send_email_via_outlook
from app.features.llm_providers.llm_providers_schemas import LLMRequest, ToolConfig


def _normalize_tool_calls(message: AIMessage) -> AIMessage:
    """
    Ensure tool calls on ``message`` are in the OpenAI-style shape expected by
    LangGraph's ``ToolNode``.

    Anthropic may return ``function.name``/``function.arguments`` instead of
    ``name``/``args``. This helper creates a clean copy when needed.
    """

    tool_calls = getattr(message, "tool_calls", None)
    if not tool_calls:
        return message

    normalized_tool_calls: list[dict] = []
    needs_rebuild = False

    for tool_call in tool_calls:
        if isinstance(tool_call, dict):
            normalized = dict(tool_call)
            function = normalized.pop("function", None)
            if isinstance(function, dict):
                needs_rebuild = True
                normalized["name"] = function.get("name", normalized.get("name", ""))
                raw_args = function.get("arguments")
                if isinstance(raw_args, str):
                    try:
                        import json

                        normalized["args"] = json.loads(raw_args)
                    except Exception:
                        normalized["args"] = {"arguments": raw_args}
                else:
                    normalized["args"] = raw_args or {}
            elif "args" not in normalized:
                needs_rebuild = True
                normalized["args"] = {}

            normalized.setdefault("id", "")
            normalized.setdefault("name", "")
            normalized_tool_calls.append(normalized)
        else:
            normalized_tool_calls.append(tool_call)

    if not needs_rebuild:
        return message

    rebuilt = AIMessage(
        content=message.content,
        tool_calls=normalized_tool_calls,
        id=message.id,
        response_metadata=message.response_metadata or {},
        usage_metadata=message.usage_metadata,
    )
    return rebuilt


def _resolve_outlook_credential_id(request: LLMRequest) -> str | None:
    """Find the Outlook credential id from the request's tool_config."""
    for config in request.tool_config or []:
        if isinstance(config, dict):
            if config.get("tool", "").lower() == "outlook":
                return config.get("credential_id")
        elif isinstance(config, ToolConfig):
            if config.tool.lower() == "outlook":
                return config.credential_id
    return None


def _extract_connector_status(result: dict) -> int | None:
    """Return the nested connector HTTP status code from a cloud-connector result.

    The WorkspaceAPIs cloud connector returns a 200-level HTTP envelope even
    when the underlying M365/Graph call fails. The real status lives at
    ``result.response.data.response.statusCode``. Returns ``None`` when absent.
    """
    try:
        envelope = (result or {}).get("response") or {}
        # envelope.data.response.statusCode
        if isinstance(envelope, dict):
            data = envelope.get("data") or {}
            if isinstance(data, dict):
                resp = data.get("response") or {}
                if isinstance(resp, dict):
                    return resp.get("statusCode")
        return None
    except Exception:
        return None


def _extract_connector_error(result: dict) -> str | None:
    """Return the nested connector error detail from a cloud-connector result.

    The real failure message lives at ``result.response.data.response.error``.
    Returns ``None`` when absent.
    """
    try:
        envelope = (result or {}).get("response") or {}
        if isinstance(envelope, dict):
            data = envelope.get("data") or {}
            if isinstance(data, dict):
                resp = data.get("response") or {}
                if isinstance(resp, dict):
                    err = resp.get("error") or resp.get("message")
                    return str(err) if err else None
        return None
    except Exception:
        return None


def create_tool_node(tools: list[BaseTool], request: LLMRequest | None = None):
    """
    Build an async tool execution node for a LangGraph workflow.

    The returned node inspects the latest ``AIMessage`` in the state,
    executes the requested tool calls using LangGraph's prebuilt
    ``ToolNode``, and returns the produced ``ToolMessage`` values.

    Connector-backed tools (e.g. ``outlook_send_email``) are executed directly
    against the WorkspaceAPIs cloud connector endpoints using credentials from
    ``request.tool_config`` instead of running a placeholder implementation.

    Args:
        tools: List of LangChain tools available to the agent.
        request: Original LLM request with tool/credential configuration.
    """

    tool_node = ToolNode(tools)

    async def execute_tools(state: ChatState):
        messages = state["messages"]
        last_message = messages[-1]

        if not isinstance(last_message, AIMessage):
            return await tool_node.ainvoke(state)

        tool_calls = getattr(last_message, "tool_calls", None) or []
        if not tool_calls:
            return await tool_node.ainvoke(state)

        logger.info(
            "Executing tools: %s",
            [tool_call.get("name") for tool_call in tool_calls],
        )

        # Connector-backed tools are handled outside of ToolNode so we can pass
        # request context (credentials, user token) to the implementation.
        connector_results: dict[str, ToolMessage] = {}
        remaining_tool_calls: list[dict] = []

        metadata = state.get("metadata") or {}
        user = metadata.get("user")

        for tool_call in tool_calls:
            tool_name = tool_call.get("name", "")
            tool_call_id = tool_call.get("id", "")
            args = tool_call.get("args", {})

            if tool_name == "outlook_send_email" and request is not None:
                credential_id = _resolve_outlook_credential_id(request)
                if not credential_id:
                    connector_results[tool_call_id] = ToolMessage(
                        content="No Outlook credential configured for this agent.",
                        tool_call_id=tool_call_id,
                        name=tool_name,
                        status="error",
                    )
                    continue

                if not isinstance(user, User):
                    connector_results[tool_call_id] = ToolMessage(
                        content="User authentication context missing.",
                        tool_call_id=tool_call_id,
                        name=tool_name,
                        status="error",
                    )
                    continue

                # Application-only M365 tokens cannot use Graph's /me endpoint, so
                # we must supply a sender mailbox. Use the model's from_address if
                # provided; otherwise fall back to the authenticated user's email.
                from_address = args.get("from_address") or args.get("from") or user.email

                try:
                    result = await send_email_via_outlook(
                        user=user,
                        credential_id=credential_id,
                        to=args.get("to", ""),
                        subject=args.get("subject", ""),
                        body=args.get("body", ""),
                        from_address=from_address,
                        cc=args.get("cc"),
                        bcc=args.get("bcc"),
                        agent_id=getattr(request, "ref_id", None),
                        agent_name=getattr(request, "ref_name", None) or getattr(request, "agent_name", None),
                    )

                    # The WorkspaceAPIs cloud connector wraps failures inside a
                    # 200 HTTP response, so ``result.status`` is often "success"
                    # even when the actual connector call failed. Extract the
                    # real nested status code + error so the model is not told
                    # "Email sent successfully" when it was rejected.
                    #   result.response.data.response.statusCode = 403 (failure)
                    #   result.response.data.response.message   = <error detail>
                    nested_status = _extract_connector_status(result)
                    nested_error = _extract_connector_error(result)

                    if result.get("status") == "success" and nested_status and 200 <= nested_status < 300:
                        connector_results[tool_call_id] = ToolMessage(
                            content=f"Email sent successfully via Outlook. Response: {result.get('response')}",
                            tool_call_id=tool_call_id,
                            name=tool_name,
                            status="success",
                        )
                    else:
                        detail = nested_error or result.get("error") or result.get("message")
                        connector_results[tool_call_id] = ToolMessage(
                            content=f"Failed to send email via Outlook: {detail}",
                            tool_call_id=tool_call_id,
                            name=tool_name,
                            status="error",
                        )
                except Exception as exc:
                    logger.exception("Outlook send email tool failed")
                    connector_results[tool_call_id] = ToolMessage(
                        content=f"Error sending email via Outlook: {exc}",
                        tool_call_id=tool_call_id,
                        name=tool_name,
                        status="error",
                    )
                continue

            remaining_tool_calls.append(tool_call)

        # Rebuild the last message with only the remaining non-connector calls.
        if remaining_tool_calls:
            normalized_last = _normalize_tool_calls(last_message)
            # Replace tool_calls list
            normalized_last.tool_calls = remaining_tool_calls
            normalized_state = dict(state)
            normalized_state["messages"] = messages[:-1] + [normalized_last]
            tool_node_result = await tool_node.ainvoke(normalized_state)
            new_messages = tool_node_result.get("messages", [])
        else:
            new_messages = []

        # Merge connector results in the same order as the original tool_calls.
        merged_messages = []
        for tool_call in tool_calls:
            tool_call_id = tool_call.get("id", "")
            if tool_call_id in connector_results:
                merged_messages.append(connector_results[tool_call_id])
            else:
                # Find the matching ToolMessage produced by ToolNode.
                matching = next(
                    (
                        msg
                        for msg in new_messages
                        if isinstance(msg, ToolMessage)
                        and getattr(msg, "tool_call_id", None) == tool_call_id
                    ),
                    None,
                )
                if matching:
                    merged_messages.append(matching)

        return {"messages": merged_messages}

    return execute_tools
