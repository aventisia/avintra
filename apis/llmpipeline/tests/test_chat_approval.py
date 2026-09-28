"""Approval-gating regression tests for the #235 chat-agent tool approvals.

Pure-function and in-memory coverage distilled from the review-fix validation
scripts (TODO 1-3): resume authorization, approval decision normalization,
structured denial markers, canonical tool naming, the bounded graph cache,
request restore, and the approvals route guard.

Run from ``apis/llmpipeline`` (``ENV`` defaults to ``local``):

    ./venv/bin/python -m pytest tests/test_chat_approval.py -q
"""

import asyncio
import inspect
from collections import OrderedDict
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

from fastapi import HTTPException
from langchain_core.messages import AIMessage, HumanMessage, ToolMessage

from app.features.auth.authenticated_user import User
from app.features.langgraph.graphs import graph_factory
from app.features.langgraph.graphs import langraph_routes as routes
from app.features.langgraph.graphs.graph_factory import _build_denied_retry_instruction
from app.features.langgraph.services import tool_skill_selector
from app.features.langgraph.services.chat_service import ChatService
from app.features.langgraph.services.request_context import restore_request
from app.features.langgraph.services.tool_approval import (
    APPROVAL_DENIED,
    APPROVAL_EXPIRED,
    APPROVAL_MARKER_KEY,
    approval_key,
    build_tool_approval_map,
    canonical_tool_name,
    denial_tool_message,
    message_approval_marker,
    normalize_approval_resume,
    pending_approval_tool_calls,
    verify_pause_owner,
)
from app.features.langgraph.services.tool_skill_selector import _format_recent_messages
from app.features.langgraph.skills.skill_registry import SkillRegistry
from app.features.langgraph.tools.tool_config_utils import (
    expand_tool_config,
    field,
    iter_tool_config_entries,
)
from app.features.langgraph.tools.tool_registry import ToolRegistry
from app.features.llm_providers.llm_providers_schemas import LLMRequest

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


def _user() -> User:
    uid, tid = uuid4(), uuid4()
    return User(user_id=uid, username="u", roles=["r"], tenant_id=tid, access_token="x")


# ---------------------------------------------------------------------------
# Resume authorization (C1/C2: unresolvable owner fails closed)
# ---------------------------------------------------------------------------


class TestVerifyPauseOwner:
    def test_live_user_match(self):
        user = _user()
        assert verify_pause_owner({"user": user}, user)

    def test_dict_with_str_ids_after_checkpoint(self):
        user = _user()
        paused = {"user": {"user_id": str(user.user_id), "tenant_id": str(user.tenant_id)}}
        assert verify_pause_owner(paused, user)

    def test_uuid_vs_str_normalized_compare(self):
        user = _user()
        paused = {"user": {"user_id": user.user_id, "tenant_id": user.tenant_id}}
        assert verify_pause_owner(paused, user)

    def test_missing_user_fails_closed(self):
        assert not verify_pause_owner({}, _user())

    def test_wrong_user_rejected(self):
        user, other = _user(), _user()
        paused = {"user": {"user_id": str(other.user_id), "tenant_id": str(user.tenant_id)}}
        assert not verify_pause_owner(paused, user)

    def test_empty_ids_rejected(self):
        user = _user()
        paused = {"user": {"user_id": None, "tenant_id": None}}
        assert not verify_pause_owner(paused, user)


# ---------------------------------------------------------------------------
# Resume decision normalization (flat dict only, fail closed to deny)
# ---------------------------------------------------------------------------


class TestNormalizeApprovalResume:
    PENDING = ["call_1", "call_2"]

    def test_approve_and_deny_mapped(self):
        got = normalize_approval_resume({"call_1": "approve", "call_2": "deny"}, self.PENDING)
        assert got == {"call_1": "approve", "call_2": "deny"}

    def test_missing_pending_id_denied(self):
        got = normalize_approval_resume({"call_1": "approve"}, self.PENDING)
        assert got["call_2"] == "deny"

    def test_junk_value_denied(self):
        got = normalize_approval_resume({"call_1": "maybe"}, self.PENDING)
        assert got["call_1"] == "deny"

    def test_non_dict_payload_denies_all(self):
        got = normalize_approval_resume(["x"], self.PENDING)
        assert all(v == "deny" for v in got.values())


# ---------------------------------------------------------------------------
# Approval keys for unnamed tool calls (C9: positional fallback, no collisions)
# ---------------------------------------------------------------------------


class TestApprovalKey:
    def test_real_id_kept(self):
        assert approval_key({"id": "abc"}, 3) == "abc"

    def test_empty_id_positional(self):
        assert approval_key({"id": ""}, 1) == "__approval_idx_1"

    def test_missing_id_positional(self):
        assert approval_key({}, 0) == "__approval_idx_0"

    def test_two_unnamed_do_not_collide(self):
        assert approval_key({}, 0) != approval_key({}, 1)


# ---------------------------------------------------------------------------
# Structured denial markers (C8: replaces prose substring matching)
# ---------------------------------------------------------------------------


class TestDenialMarkers:
    def test_denial_message_carries_marker(self):
        msg = denial_tool_message("github.api.issues.create", "call_x")
        assert msg.additional_kwargs.get(APPROVAL_MARKER_KEY) == APPROVAL_DENIED

    def test_marker_reads_kwargs(self):
        msg = ToolMessage(
            content="ok", tool_call_id="a", additional_kwargs={APPROVAL_MARKER_KEY: APPROVAL_EXPIRED}
        )
        assert message_approval_marker(msg) == APPROVAL_EXPIRED

    def test_prose_is_not_a_denial(self):
        msg = ToolMessage(content="403 permission denied", tool_call_id="a")
        assert message_approval_marker(msg) is None

    def test_dict_shaped_message(self):
        assert message_approval_marker({"additional_kwargs": {APPROVAL_MARKER_KEY: "denied"}}) == "denied"

    def test_denied_and_expired_constants(self):
        assert APPROVAL_DENIED == "denied" and APPROVAL_EXPIRED == "expired"

    def test_transcript_distinguishes_marker_from_api_prose(self):
        denied = ToolMessage(
            content="The user denied this action for the current request.",
            tool_call_id="c1",
            name="github_api_issues_create",
            additional_kwargs={APPROVAL_MARKER_KEY: APPROVAL_DENIED},
        )
        api_error = ToolMessage(
            content="Error: Permission denied by GitHub API",
            tool_call_id="c2",
            name="github_api_issues_create",
            status="error",
        )
        ai_call = AIMessage(
            content="",
            tool_calls=[{"id": "c2", "name": "github_api_issues_create", "args": {}, "type": "tool_call"}],
        )
        transcript = _format_recent_messages([ai_call, api_error, denied, HumanMessage(content="hi")])
        # API-level "Permission denied" prose means the tool ran; only the
        # structured marker reads as an unfulfilled approval.
        assert "github_api_issues_create ran earlier" in transcript
        assert "github_api_issues_create was requested earlier and did not complete" in transcript

    def test_retry_instruction_marker_driven_only(self):
        tool = MagicMock()
        tool.name = "github_api_models_list"
        human = HumanMessage(content="try again")

        marked = ToolMessage(
            content="The user denied this action for the current request.",
            tool_call_id="c9",
            name="github_api_models_list",
            additional_kwargs={APPROVAL_MARKER_KEY: APPROVAL_DENIED},
        )
        retry = _build_denied_retry_instruction([marked, human], [tool])
        assert retry is not None and "github_api_models_list" in retry

        prose_error = ToolMessage(
            content="Error: permission denied", tool_call_id="c8", name="github_api_models_list", status="error"
        )
        assert _build_denied_retry_instruction([prose_error, human], [tool]) is None

        expired = ToolMessage(
            content="Action not executed: expired",
            tool_call_id="c7",
            name="github_api_models_list",
            status="error",
            additional_kwargs={APPROVAL_MARKER_KEY: APPROVAL_EXPIRED},
        )
        assert _build_denied_retry_instruction([expired, human], [tool]) is None


class TestSanitizerExpiredMarker:
    def test_synthetic_tool_message_marked_expired(self):
        cleaned = ChatService._sanitize_tool_history(
            [AIMessage(content="", tool_calls=[{"id": "c1", "name": "t", "args": {}, "type": "tool_call"}])]
        )
        assert any(
            isinstance(m, ToolMessage) and m.additional_kwargs.get(APPROVAL_MARKER_KEY) == APPROVAL_EXPIRED
            for m in cleaned
        )


# ---------------------------------------------------------------------------
# Shared request restore (A4)
# ---------------------------------------------------------------------------


def _request() -> LLMRequest:
    return LLMRequest(
        provider="openai",
        model="gpt-4o-mini",
        input="hi",
        is_chat_agent=True,
        tool_config=[{"tool": "github", "actions": [{"action": "api.issues.create", "approval": "human"}]}],
    )


class TestRestoreRequest:
    def test_live_instance_kept(self):
        req = _request()
        assert restore_request({"request": req}, None) is req

    def test_dict_rebuilt_into_llm_request(self):
        restored = restore_request({"request": _request().model_dump(mode="json")}, None)
        assert isinstance(restored, LLMRequest) and restored.is_chat_agent

    def test_tool_config_survives_round_trip(self):
        restored = restore_request({"request": _request().model_dump(mode="json")}, None)
        assert restored is not None and restored.tool_config
        assert restored.tool_config[0].tool == "github"

    def test_broken_dict_uses_fallback(self):
        assert restore_request({"request": {"bogus": 1}}, "F") == "F"

    def test_missing_key_uses_fallback(self):
        assert restore_request({}, "F") == "F"

    def test_broken_dict_without_fallback_is_none(self):
        assert restore_request({"request": {"bogus": 1}}, None) is None


# ---------------------------------------------------------------------------
# Bounded graph cache + conversation index (C3/C4/C5)
# ---------------------------------------------------------------------------


def _service() -> ChatService:
    return ChatService(ToolRegistry(), SkillRegistry(), conversation_service=None)


def _key(conv: str, tools: tuple = ()):
    # Mirrors the cache key tuple: (provider, model, conversation_id,
    # tool_key, skill_key, is_temp_chat).
    return ("openai", "gpt-4o-mini", conv, tuple(sorted(tools)), ("__agent_select__",), False)


class TestGraphCache:
    def test_init_ordered_dict_with_limit(self):
        svc = _service()
        assert isinstance(svc._graphs, OrderedDict)
        assert svc._graph_cache_limit == 512

    def test_index_latest_graph_wins(self):
        # Config edits change the tool key; the index must point at the newest
        # graph so a resume finds the paused instance, not a stale twin.
        svc = _service()
        k_old = _key("c1", ("github_api_models_list",))
        k_new = _key("c1", ("github_api_models_list", "outlook_send_email"))
        svc._graphs[k_old] = "graph-old"
        svc._graphs[k_new] = "graph-new"
        svc._conversation_graph_key["c1"] = k_old
        svc._conversation_graph_key["c1"] = k_new
        assert svc._graph_for_conversation("c1") == "graph-new"

    def test_unknown_conversation_is_none(self):
        assert _service()._graph_for_conversation("zz") is None

    def test_eviction_skips_pending_and_cleans_index(self):
        svc = _service()
        svc._graph_cache_limit = 3
        keys = [_key(f"conv{i}") for i in range(4)]
        for k in keys:
            svc._graphs[k] = f"g-{k[2]}"
            svc._conversation_graph_key[k[2]] = k
        # conv0 is oldest but holds a live approval pause.
        svc._pending_approval_conversations.add("conv0")
        svc._evict_graph_cache()
        assert len(svc._graphs) == 3
        assert keys[0] in svc._graphs
        assert keys[1] not in svc._graphs
        assert "conv1" not in svc._conversation_graph_key
        assert svc._conversation_graph_key.get("conv0") == keys[0]

    def test_all_pending_cache_may_exceed_limit(self):
        # Never strand a pause: if every entry is pending, eviction keeps them
        # all and the cache temporarily exceeds its cap.
        svc = _service()
        svc._graph_cache_limit = 1
        for i in range(3):
            k = _key(f"p{i}")
            svc._graphs[k] = "g"
            svc._conversation_graph_key[f"p{i}"] = k
            svc._pending_approval_conversations.add(f"p{i}")
        svc._evict_graph_cache()
        assert len(svc._graphs) == 3


# ---------------------------------------------------------------------------
# Tool-config utils (TODO 3 extraction)
# ---------------------------------------------------------------------------


class _Action:
    def __init__(self, action, approval=None):
        self.action = action
        self.approval = approval


class _Tool:
    def __init__(self, tool, actions):
        self.tool = tool
        self.actions = actions


class _ObjWithAttrs:
    tool = "github"
    approval = None


class TestField:
    def test_attr_read(self):
        assert field(_ObjWithAttrs(), "tool", "") == "github"

    def test_dict_read(self):
        assert field({"tool": "gmail"}, "tool", "") == "gmail"

    def test_none_falls_to_default(self):
        assert field(_ObjWithAttrs(), "approval", "human") == "human"

    def test_empty_string_kept(self):
        assert field({"tool": ""}, "tool", "x") == ""

    def test_missing_key_default(self):
        assert field({}, "tool", "d") == "d"


class TestExpandToolConfig:
    def test_shapes(self):
        legacy = _Tool("outlook", [_Action("send_email", "human")])
        corsair = _Tool("github", [_Action("api.issues.create", "auto")])
        dotted = {"tool": "github.api", "actions": [{"action": "issues.list", "approval": "human"}]}
        raw = {"tool": "search", "actions": []}
        names = expand_tool_config([legacy, corsair, dotted, raw])
        assert "outlook_send_email" in names
        assert any(n.startswith("github") and n.endswith(".api.issues.create") for n in names)
        assert "github.api.issues.list" in names
        assert "search" in names

    def test_iter_keeps_approval_values(self):
        legacy = _Tool("outlook", [_Action("send_email", "human")])
        corsair = _Tool("github", [_Action("api.issues.create", "auto")])
        pairs = dict(iter_tool_config_entries([legacy, corsair]))
        assert pairs.get("outlook_send_email") == "human"
        assert any(a == "auto" for (_, a) in pairs.items())


class TestBuildToolApprovalMap:
    def test_fail_closed_defaults(self):
        amap = build_tool_approval_map(
            [
                {"tool": "outlook", "actions": [{"action": "send_email", "approval": "auto"}]},
                {"tool": "github", "actions": [{"action": "api.issues.create", "approval": "nonsense"}]},
            ]
        )
        assert amap.get("outlook_send_email") == "auto"
        assert amap.get("github.api.issues.create") == "human"

    def test_none_config_empty_map(self):
        assert build_tool_approval_map(None) == {}


class TestCanonicalToolName:
    def test_bound_metadata_path_wins(self):
        got = canonical_tool_name(
            "github_api_issues_create", {"github_api_issues_create": "github.api.issues.create"}
        )
        assert got == "github.api.issues.create"

    def test_sanitized_fallback(self):
        assert canonical_tool_name("openai_api_models_list") == "openai.api.models.list"

    def test_legacy_unchanged(self):
        assert canonical_tool_name("outlook_send_email") == "outlook_send_email"


class TestPendingApprovalToolCalls:
    def test_extracted_from_state(self):
        item = MagicMock()
        item.value = [{"tool_call_id": "c1", "name": "t", "args": {}}]
        task = MagicMock()
        task.interrupts = [item]
        state = MagicMock()
        state.tasks = [task]
        pending = pending_approval_tool_calls(state)
        assert [c["tool_call_id"] for c in pending] == ["c1"]

    def test_none_state_empty(self):
        assert pending_approval_tool_calls(None) == []


# ---------------------------------------------------------------------------
# Wiring + route guard
# ---------------------------------------------------------------------------


class TestModuleWiring:
    def test_selector_uses_shared_marker(self):
        # graph_factory/selector must import from tool_approval, not re-declare.
        assert hasattr(tool_skill_selector, "message_approval_marker")

    def test_seed_node_does_not_spread_metadata(self):
        src = inspect.getsource(graph_factory._create_seed_request_node)
        assert "**metadata" not in src


class TestApprovalsRouteGuard:
    """Submitted tool_call_ids must belong to the pending batch (TODO 3)."""

    async def _flow(self, unknown_id: str):
        req = routes.ChatApprovalRequest(
            conversation_id="11111111-1111-1111-1111-111111111111",
            decisions=[routes.ApprovalDecision(tool_call_id=unknown_id, decision="approve")],
        )
        with patch.object(routes, "chat_service") as svc:
            svc.get_pending_approval = AsyncMock(
                return_value=(
                    MagicMock(is_temp_chat=True),
                    [{"tool_call_id": "real-1", "name": "t", "args": {}}],
                )
            )
            try:
                await routes.approve_langgraph_tool_calls_route(req, user=_user())
                return "no-error"
            except HTTPException as exc:
                return exc.status_code

    def test_unknown_id_rejected_409(self):
        assert asyncio.run(self._flow("bogus-id")) == 409

    def test_known_id_passes_guard(self):
        assert asyncio.run(self._flow("real-1")) == "no-error"
