"""Structured schemas for tool configuration and results."""

from typing import Any

from pydantic import BaseModel, Field


class ToolActionConfig(BaseModel):
    """
    Configuration for a single action exposed by a tool integration.

    Example:
        ``{"action": "send_email", "approval": "manual"}``
    """

    action: str = Field(
        description="Action name supported by the tool.",
    )
    approval: str | None = Field(
        default=None,
        description="Approval policy for the action (e.g. auto, manual).",
    )


class ToolConfig(BaseModel):
    """
    Request-scoped configuration for one tool integration.

    Example:
        ``{"tool": "gmail", "credential_name": "gmail-cred", "actions": [...]}``
    """

    tool: str = Field(
        description="Unique tool identifier.",
    )
    credential_name: str | None = Field(
        default=None,
        description="Optional BYOK credential name.",
    )
    actions: list[ToolActionConfig] = Field(
        default_factory=list,
        description="Actions the agent is allowed to invoke.",
    )


class ToolResult(BaseModel):
    """
    Normalized result returned by a tool execution.

    This schema is used by the platform's tool execution node so that
    downstream nodes can rely on a consistent shape regardless of the
    underlying integration.
    """

    tool: str = Field(
        description="Tool identifier that produced the result.",
    )
    action: str | None = Field(
        default=None,
        description="Action that was executed, if any.",
    )
    success: bool = Field(
        default=True,
        description="Whether the tool call succeeded.",
    )
    output: Any = Field(
        default=None,
        description="Tool output. May be a string, dict, or structured data.",
    )
    error: str | None = Field(
        default=None,
        description="Error message when success is False.",
    )
