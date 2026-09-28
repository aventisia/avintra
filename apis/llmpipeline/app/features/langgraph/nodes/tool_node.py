"""Tool node that normalizes tool calls before invoking the LangGraph ToolNode."""

import json

from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.tools import BaseTool
from langgraph.prebuilt import ToolNode
from langgraph.types import interrupt

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.schemas.graph_state import ChatState
from app.features.langgraph.services.request_context import restore_request
from app.features.langgraph.services.tool_skill_selector import (
    build_tool_approval_map,
)
from app.features.langgraph.tools.outlook.outlook_client import send_email_via_outlook
from app.features.llm_providers.llm_providers_schemas import LLMRequest, ToolConfig
from app.features.llm_providers.services.corsair_sidecar_service import (
    invoke_corsair_tool,
    is_corsair_tool,
    parse_corsair_tool_name,
    to_corsair_tool_path,
)


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


def _resolve_outlook_credential_name(request: LLMRequest) -> str | None:
    """Find the Outlook credential name from the request's tool_config."""
    for config in request.tool_config or []:
        if isinstance(config, dict):
            if config.get("tool", "").lower() == "outlook":
                return config.get("credential_name")
        elif isinstance(config, ToolConfig):
            if config.tool.lower() == "outlook":
                return config.credential_name
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


def _approval_key(tool_call: dict, index: int) -> str:
    """Stable batch key for one tool call's approval decision.

    Falls back to a positional key when the model emits a tool call without an
    id, so unnamed calls cannot collide on the empty-string key.
    """

    return tool_call.get("id") or f"__approval_idx_{index}"


def _normalize_approval_resume(
    resume_payload,
    pending_tool_call_ids: list[str],
) -> dict[str, str]:
    """Normalize an interrupt resume payload into ``{tool_call_id: approve|deny}``.

    The approvals route sends a flat mapping of approval key to decision
    (see ``_approval_key``). Anything that is not an explicit "approve" counts
    as a denial.
    """

    entries = (
        [
            {"tool_call_id": key, "decision": value}
            for key, value in resume_payload.items()
        ]
        if isinstance(resume_payload, dict)
        else []
    )

    decisions: dict[str, str] = {}
    for entry in entries:
        tool_call_id = entry["tool_call_id"]
        decision = entry["decision"]
        if tool_call_id:
            decisions[str(tool_call_id)] = (
                "approve"
                if str(decision).strip().lower() == "approve"
                else "deny"
            )

    # Fail closed: a pending call without an explicit approval is denied.
    for tool_call_id in pending_tool_call_ids:
        decisions.setdefault(tool_call_id, "deny")

    return decisions


def _canonical_tool_name(
    tool_name: str,
    corsair_paths: dict[str, str] | None = None,
) -> str:
    """Resolve a model-facing tool name to the canonical configured name.

    Corsair tools are bound under an OpenAI-safe name (dots replaced with
    underscores, e.g. ``openai_api_models_list``) while ``tool_config`` entries
    use the dotted sidecar path (``openai.api.models.list``). Bound tools carry
    their original path in ``metadata["corsair_path"]``; when that is not
    available the sanitized ``_api_`` form is parsed back to the dotted path.
    """

    if not tool_name:
        return tool_name

    if corsair_paths and corsair_paths.get(tool_name):
        return corsair_paths[tool_name]

    if is_corsair_tool(tool_name):
        try:
            plugin, action = parse_corsair_tool_name(tool_name)
            return to_corsair_tool_path(plugin, action)
        except ValueError:
            return tool_name

    return tool_name


def _request_tool_approvals(
    tool_calls: list[dict],
    request: LLMRequest,
    corsair_paths: dict[str, str] | None = None,
) -> dict[str, str]:
    """Pause for user approval on configured actions that require it.

    Returns ``{tool_call_id: "approve"|"deny"}`` for the human-approval calls in
    this batch. Calls configured with ``approval: "auto"`` are not included. The
    interrupt happens before anything in the batch executes, so a resume never
    re-runs already-executed calls.
    """

    approval_map = build_tool_approval_map(
        getattr(request, "tool_config", None) or []
    )

    pending = []
    for index, tool_call in enumerate(tool_calls):
        # Model-facing Corsair names are sanitized; configured approval keys are
        # canonical dotted paths, so compare on the canonical name.
        lookup_name = _canonical_tool_name(
            tool_call.get("name", ""),
            corsair_paths,
        )
        # Missing approval fails closed to "human".
        if approval_map.get(lookup_name, "human") == "auto":
            continue
        pending.append(
            {
                "tool_call_id": _approval_key(tool_call, index),
                "name": lookup_name or tool_call.get("name", ""),
                "args": tool_call.get("args") or {},
            }
        )

    if not pending:
        return {}

    logger.debug(
        "Pausing for tool approval: %s",
        [item["name"] for item in pending],
    )

    resume_payload = interrupt(pending)

    return _normalize_approval_resume(
        resume_payload, [item["tool_call_id"] for item in pending]
    )


def _denial_message(tool_name: str, tool_call_id: str) -> ToolMessage:
    """Build the ToolMessage returned to the model when a user denies an action."""

    return ToolMessage(
        content=(
            "The user denied this action for the current request, so it did not "
            "run. Acknowledge the denial and continue without performing the "
            "action now. If the user explicitly asks later to try again, you may "
            "call this action again."
        ),
        tool_call_id=tool_call_id,
        name=tool_name,
        status="error",
        # Machine-readable marker; retry/dedup detection must never parse prose.
        additional_kwargs={"worc_approval": "denied"},
    )


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

        logger.debug(
            "Executing tools: %s",
            [tool_call.get("name") for tool_call in tool_calls],
        )

        metadata = state.get("metadata") or {}
        user = metadata.get("user")
        # Endpoint-seeded live request; the build-time request is the fallback
        # (checkpoint round-trips deserialize the live one to a dict).
        current_request = restore_request(metadata, request)

        # Bound Corsair tools keep their canonical dotted path in metadata; the
        # model only ever emits the sanitized (underscored) name.
        corsair_paths = {
            tool.name: (getattr(tool, "metadata", None) or {}).get("corsair_path")
            for tool in tools
        }
        corsair_paths = {name: path for name, path in corsair_paths.items() if path}

        # IMPORTANT NOTE: Interactive chat turns pause for human approval
        # before executing ANY call in the batch (auto + human together), so a
        # resume never re-runs a call that already had side effects. The pause
        # invariant: no tool executes until every human-approval call in the
        # batch has an explicit decision.
        approval_decisions: dict[str, str] = {}
        if (
            metadata.get("approval_enabled")
            and current_request is not None
            and getattr(current_request, "is_chat_agent", False)
        ):
            approval_decisions = _request_tool_approvals(
                tool_calls, current_request, corsair_paths
            )

        # Connector-backed tools are handled outside of ToolNode so we can pass
        # request context (credentials, user token) to the implementation.
        precomputed_results: dict[str, ToolMessage] = {}
        remaining_tool_calls: list[dict] = []

        for index, tool_call in enumerate(tool_calls):
            tool_name = tool_call.get("name", "")
            # Approval-keyed so unnamed calls cannot collide on the empty id;
            # for calls that have one this is the tool_call_id unchanged.
            tool_call_id = _approval_key(tool_call, index)
            args = tool_call.get("args", {})

            # A denied human-approval call short-circuits: the model receives a
            # denial ToolMessage and the turn continues without the action.
            if approval_decisions.get(tool_call_id) == "deny":
                precomputed_results[tool_call_id] = _denial_message(
                    tool_name, tool_call_id
                )
                continue

            # Corsair sidecar tools: dotted names like "github.issues.create" are
            # routed to the sidecar directly, using credentials from the request.
            if is_corsair_tool(tool_name) and current_request is not None:
                if not isinstance(user, User):
                    precomputed_results[tool_call_id] = ToolMessage(
                        content="User authentication context missing for Corsair tool.",
                        tool_call_id=tool_call_id,
                        name=tool_name,
                        status="error",
                    )
                    continue

                try:
                    result = await invoke_corsair_tool(
                        tool_name=corsair_paths.get(tool_name, tool_name),
                        arguments=args,
                        llm_request=current_request,
                        user=user,
                    )

                    if result.get("success"):
                        content = json.dumps(result.get("data")) if result.get("data") is not None else "Corsair tool executed successfully."
                        precomputed_results[tool_call_id] = ToolMessage(
                            content=content,
                            tool_call_id=tool_call_id,
                            name=tool_name,
                            status="success",
                        )
                    else:
                        precomputed_results[tool_call_id] = ToolMessage(
                            content=f"Corsair tool failed: {result.get('error') or result.get('message') or result}",
                            tool_call_id=tool_call_id,
                            name=tool_name,
                            status="error",
                        )
                except Exception as exc:
                    logger.exception("Corsair sidecar tool failed for %s", tool_name)
                    precomputed_results[tool_call_id] = ToolMessage(
                        content=f"Error invoking Corsair tool {tool_name}: {exc}",
                        tool_call_id=tool_call_id,
                        name=tool_name,
                        status="error",
                    )
                continue

            if tool_name == "outlook_send_email" and current_request is not None:
                credential_name = _resolve_outlook_credential_name(current_request)
                if not credential_name:
                    precomputed_results[tool_call_id] = ToolMessage(
                        content="No Outlook credential configured for this agent.",
                        tool_call_id=tool_call_id,
                        name=tool_name,
                        status="error",
                    )
                    continue

                if not isinstance(user, User):
                    precomputed_results[tool_call_id] = ToolMessage(
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
                        credential_name=credential_name,
                        to=args.get("to", ""),
                        subject=args.get("subject", ""),
                        body=args.get("body", ""),
                        from_address=from_address,
                        cc=args.get("cc"),
                        bcc=args.get("bcc"),
                        agent_id=getattr(current_request, "ref_id", None),
                        agent_name=getattr(current_request, "ref_name", None) or getattr(current_request, "agent_name", None),
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
                        precomputed_results[tool_call_id] = ToolMessage(
                            content=f"Email sent successfully via Outlook. Response: {result.get('response')}",
                            tool_call_id=tool_call_id,
                            name=tool_name,
                            status="success",
                        )
                    else:
                        detail = nested_error or result.get("error") or result.get("message")
                        precomputed_results[tool_call_id] = ToolMessage(
                            content=f"Failed to send email via Outlook: {detail}",
                            tool_call_id=tool_call_id,
                            name=tool_name,
                            status="error",
                        )
                except Exception as exc:
                    logger.exception("Outlook send email tool failed")
                    precomputed_results[tool_call_id] = ToolMessage(
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
        consumed: set[int] = set()
        for index, tool_call in enumerate(tool_calls):
            tool_call_id = _approval_key(tool_call, index)
            if tool_call_id in precomputed_results:
                merged_messages.append(precomputed_results[tool_call_id])
                continue

            # Find the matching ToolMessage produced by ToolNode. Real ids are
            # matched exactly; unnamed calls consume the first unclaimed
            # unnamed result so two of them cannot share one message.
            real_id = tool_call.get("id", "")
            matching = next(
                (
                    (position, msg)
                    for position, msg in enumerate(new_messages)
                    if position not in consumed
                    and isinstance(msg, ToolMessage)
                    and (
                        (
                            bool(real_id)
                            and getattr(msg, "tool_call_id", None) == real_id
                        )
                        or (
                            not real_id
                            and not (getattr(msg, "tool_call_id", None) or "")
                        )
                    )
                ),
                None,
            )
            if matching:
                position, msg = matching
                consumed.add(position)
                merged_messages.append(msg)

        return {"messages": merged_messages}

    return execute_tools
