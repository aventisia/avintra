"""Execute one configured tool call for any engine.

The LangGraph tool node and the realtime voice bridge both run tools through
this module, so a call has one implementation for LangChain tools, Corsair,
Outlook, custom OpenAPI tools, and credential lookup.
"""

from __future__ import annotations

import json
from collections.abc import Sequence

from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.tools import BaseTool
from langgraph.prebuilt import ToolNode
from langgraph.runtime import Runtime

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.tools.outlook.outlook_client import send_email_via_outlook
from app.features.llm_providers.llm_providers_schemas import LLMRequest, ToolConfig
from app.features.llm_providers.services.corsair_sidecar_service import (
    invoke_corsair_tool,
    is_corsair_tool,
)

TOOL_STATUS_SUCCESS = "success"
TOOL_STATUS_ERROR = "error"


def tool_message(
    content: str,
    *,
    tool_call_id: str,
    name: str,
    status: str = TOOL_STATUS_SUCCESS,
) -> ToolMessage:
    """Build the result message every engine returns to its model."""

    return ToolMessage(
        content=content,
        tool_call_id=tool_call_id,
        name=name,
        status=status,
    )


class ToolExecutor:
    """Run one tool call against the tools configured for a request."""

    def __init__(
        self,
        tools: Sequence[BaseTool],
        request: LLMRequest | None,
        user: User | None,
    ) -> None:
        self._tools = list(tools)
        self._request = request
        self._user = user
        # IMPORTANT NOTE: bound Corsair tools keep their canonical dotted path in
        # metadata; the model only ever emits the sanitized (underscored) name.
        self._corsair_paths = {
            tool.name: (getattr(tool, "metadata", None) or {}).get("corsair_path")
            for tool in self._tools
        }
        self._corsair_paths = {
            name: path for name, path in self._corsair_paths.items() if path
        }

    @property
    def corsair_paths(self) -> dict[str, str]:
        """Map each bound Corsair tool's model-facing name to its dotted path."""

        return self._corsair_paths

    async def try_connector(
        self,
        tool_name: str,
        args: dict,
        *,
        tool_call_id: str,
    ) -> ToolMessage | None:
        """Run a connector-backed call, or return ``None`` for a LangChain tool.

        Connector tools are handled outside ``ToolNode`` so the request context
        (credentials, user token) reaches the implementation.
        """

        if is_corsair_tool(tool_name) and self._request is not None:
            return await self._corsair(tool_name, args, tool_call_id)
        if tool_name == "outlook_send_email" and self._request is not None:
            return await self._outlook(tool_name, args, tool_call_id)
        return None

    async def execute(
        self,
        tool_name: str,
        args: dict,
        *,
        tool_call_id: str,
    ) -> ToolMessage:
        """Run one call: connector-routed tools first, then the LangChain tool."""

        connector_result = await self.try_connector(
            tool_name,
            args,
            tool_call_id=tool_call_id,
        )
        if connector_result is not None:
            return connector_result

        tool = next((item for item in self._tools if item.name == tool_name), None)
        if tool is None:
            return tool_message(
                f"Tool '{tool_name}' is not configured for this agent.",
                tool_call_id=tool_call_id,
                name=tool_name,
                status=TOOL_STATUS_ERROR,
            )

        node = ToolNode([tool])
        result = await node.ainvoke(
            {
                "messages": [
                    AIMessage(
                        content="",
                        tool_calls=[
                            {
                                "id": tool_call_id or tool_name,
                                "name": tool_name,
                                "args": args,
                                "type": "tool_call",
                            }
                        ],
                    )
                ]
            },
            # IMPORTANT NOTE: ToolNode outside a compiled graph still reads its
            # runtime from this private config key; without it every call fails.
            config={"configurable": {"__pregel_runtime": Runtime()}},
        )
        for message in result.get("messages") or []:
            if isinstance(message, ToolMessage):
                return message
        return tool_message(
            "The tool returned no result.",
            tool_call_id=tool_call_id,
            name=tool_name,
            status=TOOL_STATUS_ERROR,
        )

    async def _corsair(
        self,
        tool_name: str,
        args: dict,
        tool_call_id: str,
    ) -> ToolMessage:
        if not isinstance(self._user, User):
            return tool_message(
                "User authentication context missing for Corsair tool.",
                tool_call_id=tool_call_id,
                name=tool_name,
                status=TOOL_STATUS_ERROR,
            )

        try:
            result = await invoke_corsair_tool(
                tool_name=self._corsair_paths.get(tool_name, tool_name),
                arguments=args,
                llm_request=self._request,
                user=self._user,
            )
        except Exception as exc:
            logger.exception("Corsair sidecar tool failed for %s", tool_name)
            return tool_message(
                f"Error invoking Corsair tool {tool_name}: {exc}",
                tool_call_id=tool_call_id,
                name=tool_name,
                status=TOOL_STATUS_ERROR,
            )

        if result.get("success"):
            content = (
                json.dumps(result.get("data"))
                if result.get("data") is not None
                else "Corsair tool executed successfully."
            )
            return tool_message(
                content,
                tool_call_id=tool_call_id,
                name=tool_name,
                status=TOOL_STATUS_SUCCESS,
            )

        return tool_message(
            f"Corsair tool failed: {result.get('error') or result.get('message') or result}",
            tool_call_id=tool_call_id,
            name=tool_name,
            status=TOOL_STATUS_ERROR,
        )

    async def _outlook(
        self,
        tool_name: str,
        args: dict,
        tool_call_id: str,
    ) -> ToolMessage:
        credential_name = _resolve_outlook_credential_name(self._request)
        if not credential_name:
            return tool_message(
                "No Outlook credential configured for this agent.",
                tool_call_id=tool_call_id,
                name=tool_name,
                status=TOOL_STATUS_ERROR,
            )

        if not isinstance(self._user, User):
            return tool_message(
                "User authentication context missing.",
                tool_call_id=tool_call_id,
                name=tool_name,
                status=TOOL_STATUS_ERROR,
            )

        # IMPORTANT NOTE: application-only M365 tokens cannot use Graph's /me
        # endpoint, so a sender mailbox must be supplied.
        from_address = args.get("from_address") or args.get("from") or self._user.email

        try:
            result = await send_email_via_outlook(
                user=self._user,
                credential_name=credential_name,
                to=args.get("to", ""),
                subject=args.get("subject", ""),
                body=args.get("body", ""),
                from_address=from_address,
                cc=args.get("cc"),
                bcc=args.get("bcc"),
                agent_id=getattr(self._request, "ref_id", None),
                agent_name=getattr(self._request, "ref_name", None)
                or getattr(self._request, "agent_name", None),
            )
        except Exception as exc:
            logger.exception("Outlook send email tool failed")
            return tool_message(
                f"Error sending email via Outlook: {exc}",
                tool_call_id=tool_call_id,
                name=tool_name,
                status=TOOL_STATUS_ERROR,
            )

        # IMPORTANT NOTE: WorkspaceAPIs wraps connector failures inside a 200 HTTP
        # response, so the real status code and error live in the nested payload.
        nested_status = _extract_connector_status(result)
        nested_error = _extract_connector_error(result)

        if result.get("status") == "success" and nested_status and 200 <= nested_status < 300:
            return tool_message(
                f"Email sent successfully via Outlook. Response: {result.get('response')}",
                tool_call_id=tool_call_id,
                name=tool_name,
                status=TOOL_STATUS_SUCCESS,
            )

        detail = nested_error or result.get("error") or result.get("message")
        return tool_message(
            f"Failed to send email via Outlook: {detail}",
            tool_call_id=tool_call_id,
            name=tool_name,
            status=TOOL_STATUS_ERROR,
        )


def _resolve_outlook_credential_name(request: LLMRequest | None) -> str | None:
    """Find the Outlook credential name from the request's tool_config."""

    for config in (request.tool_config if request is not None else None) or []:
        if isinstance(config, dict):
            if (config.get("tool") or "").lower() == "outlook":
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
