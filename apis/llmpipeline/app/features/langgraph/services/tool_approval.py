"""Human-approval gate for chat-agent tool calls.

Owns the whole approval concern: the per-action approval policy map, the
interrupt/decision normalization, denial messaging, canonical-name resolution
across the Corsair sanitized/dotted naming split, pending-pause extraction
from graph state, and pause ownership verification.

IMPORTANT NOTE: the pause covers the WHOLE tool-call batch and happens before
any call executes, so a resume never re-runs a side-effecting call. Approval
decisions fail closed: unknown ids, missing decisions, and unresolvable pause
owners are always treated as denial/rejection, never as approval.
"""

from typing import Any

from langchain_core.messages import ToolMessage
from langgraph.types import interrupt

from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.tools.tool_config_utils import (
    APPROVAL_AUTO,
    APPROVAL_HUMAN,
    iter_tool_config_entries,
)
from app.features.llm_providers.llm_providers_schemas import LLMRequest
from app.features.llm_providers.services.corsair_sidecar_service import (
    is_corsair_tool,
    parse_corsair_tool_name,
    to_corsair_tool_path,
)

# Default policy for a configured action with a missing/unrecognized approval.
DEFAULT_APPROVAL = APPROVAL_HUMAN

# Machine-readable marker on approval-outcome ToolMessages. Detection must
# never parse prose ("permission denied" in an API error is not a user denial).
APPROVAL_MARKER_KEY = "worc_approval"
APPROVAL_DENIED = "denied"
APPROVAL_EXPIRED = "expired"


def build_tool_approval_map(tool_config: list[Any] | None) -> dict[str, str]:
    """Map normalized configured tool names to their approval policy.

    Studio sends one ``approval`` per action (``"auto"`` | ``"human"``).
    Missing or unrecognized values fail closed to ``DEFAULT_APPROVAL`` so an
    action can never auto-execute without an explicit ``auto`` configuration.
    Names are normalized exactly like bound tool names (see
    ``tools.tool_config_utils.expand_tool_config``).
    """

    approvals: dict[str, str] = {}
    for name, approval in iter_tool_config_entries(tool_config or []):
        approvals[name] = (
            APPROVAL_AUTO
            if str(approval).strip().lower() == APPROVAL_AUTO
            else DEFAULT_APPROVAL
        )
    return approvals


def message_approval_marker(message: Any) -> str | None:
    """Read the ``worc_approval`` marker from a tool-result message.

    Returns ``"denied"``/``"expired"`` only for machine-marked messages. Prose
    in tool output (e.g. a "permission denied" API error) is never treated as
    an approval outcome.
    """

    kwargs = getattr(message, "additional_kwargs", None)
    if kwargs is None and isinstance(message, dict):
        kwargs = message.get("additional_kwargs")
    if not isinstance(kwargs, dict):
        return None
    marker = kwargs.get(APPROVAL_MARKER_KEY)
    return str(marker) if marker else None


def approval_key(tool_call: dict, index: int) -> str:
    """Stable batch key for one tool call's approval decision.

    Falls back to a positional key when the model emits a tool call without an
    id, so unnamed calls cannot collide on the empty-string key.
    """

    return tool_call.get("id") or f"__approval_idx_{index}"


def normalize_approval_resume(
    resume_payload,
    pending_tool_call_ids: list[str],
) -> dict[str, str]:
    """Normalize an interrupt resume payload into ``{tool_call_id: approve|deny}``.

    The approvals route sends a flat mapping of approval key to decision
    (see ``approval_key``). Anything that is not an explicit "approve" counts
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


def canonical_tool_name(
    tool_name: str,
    corsair_paths: dict[str, str] | None = None,
) -> str:
    """Resolve a model-facing tool name to the canonical configured name.

    Corsair tools are bound under an OpenAI-safe name (dots replaced with
    underscores, e.g. ``openai_api_models_list``) while ``tool_config`` entries
    use the dotted sidecar path (``openai.api.models.list``). Bound tools carry
    their original path in ``metadata["corsair_path"]`` (stamped by
    ``tools/corsair/corsair_tool_factory.py``); when that is not available the
    sanitized ``_api_`` form is parsed back to the dotted path.
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


def request_tool_approvals(
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
        lookup_name = canonical_tool_name(
            tool_call.get("name", ""),
            corsair_paths,
        )
        # Missing approval fails closed to "human".
        if approval_map.get(lookup_name, DEFAULT_APPROVAL) == APPROVAL_AUTO:
            continue
        pending.append(
            {
                "tool_call_id": approval_key(tool_call, index),
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

    return normalize_approval_resume(
        resume_payload, [item["tool_call_id"] for item in pending]
    )


def denial_tool_message(tool_name: str, tool_call_id: str) -> ToolMessage:
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
        additional_kwargs={APPROVAL_MARKER_KEY: APPROVAL_DENIED},
    )


def pending_approval_tool_calls(state: Any) -> list[dict]:
    """Extract pending human-approval tool calls from a graph snapshot."""

    if state is None:
        return []

    pending: list[dict] = []
    for task in getattr(state, "tasks", ()) or ():
        for item in getattr(task, "interrupts", ()) or ():
            value = getattr(item, "value", None)
            if isinstance(value, list):
                pending.extend(
                    call
                    for call in value
                    if isinstance(call, dict) and call.get("tool_call_id")
                )
    return pending


def verify_pause_owner(metadata: dict[str, Any], user: User) -> bool:
    """Check that a paused approval belongs to ``user``. Fail closed.

    IMPORTANT NOTE: an unresolvable owner in checkpoint metadata rejects the
    resume (409 upstream). A pause whose ownership cannot be verified is never
    resumable by another user, even if the conversation id is known.
    """

    paused_user = metadata.get("user")
    if isinstance(paused_user, User):
        paused_user_id = str(paused_user.user_id)
        paused_tenant_id = str(paused_user.tenant_id)
    elif isinstance(paused_user, dict):
        paused_user_id = str(paused_user.get("user_id") or "")
        paused_tenant_id = str(paused_user.get("tenant_id") or "")
    else:
        return False

    return bool(paused_user_id) and bool(paused_tenant_id) and (
        paused_user_id == str(user.user_id)
        and paused_tenant_id == str(user.tenant_id)
    )
