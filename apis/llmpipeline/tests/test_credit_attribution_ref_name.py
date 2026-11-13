"""Regression tests: credit attribution reads the single surviving agent name field.

Callers send the agent name once (``ref_name``). Every ledger entry must still
carry that name in both the reference-name column (``RefName``) and the
triggering-agent column (``TriggeredByAgent``), so dropping the duplicated
``agent_name`` field must not change who a usage row is billed to.

Run from ``apis/llmpipeline``:

    ./venv/bin/python -m pytest tests/test_credit_attribution_ref_name.py -q
"""

import asyncio
from types import SimpleNamespace

from app.features.langgraph.services import credit_usage_service
from app.features.langgraph.tools.outlook import outlook_client
from app.features.llm_providers.llm_providers_schemas import LLMRequest
from app.features.litellm.core import credit_utils
from app.features.litellm.core.schemas import (
    EmbeddingRequest,
    EmbeddingResponse,
    LLMGenerationRequest,
    LLMGenerationResponse,
)
from app.features.litellm.embeddings import embedding_service
from app.features.litellm.text_generation import generation_service

AGENT_NAME = "Invoice Triage Agent"


class _CapturingCreditManager:
    def __init__(self):
        self.requests = []

    def post_credit_usage(self, task, request, jwt):
        self.requests.append((task, request, jwt))


def test_post_credit_usage_carries_ref_name_in_both_columns(monkeypatch):
    manager = _CapturingCreditManager()
    monkeypatch.setattr(credit_utils, "CreditManagerService", lambda: manager)
    monkeypatch.setattr(credit_utils, "agent_has_fixed_credits", lambda ref_id, token: False)

    request = SimpleNamespace(
        provider="elevenlabs",
        model="scribe_v2",
        ref_type="Agent",
        ref_id="ref-1",
        ref_name=AGENT_NAME,
        action="AgentExecution",
    )

    credit_utils.post_credit_usage(request, "elevenlabs", "service", 12.5, "jwt", "space-1")

    assert len(manager.requests) == 1
    _, entries, _ = manager.requests[0]
    assert entries[0]["RefName"] == AGENT_NAME
    assert entries[0]["TriggeredByAgent"] == AGENT_NAME
    assert entries[0]["SpaceId"] == "space-1"


def test_text_generation_credit_entries_carry_ref_name_in_both_columns(monkeypatch):
    captured = {}
    monkeypatch.setattr(generation_service, "agent_has_fixed_credits", lambda ref_id, token: False)
    monkeypatch.setattr(
        generation_service,
        "get_credit_service_type",
        lambda provider, model, kind: f"Gpt4o{kind.title()}",
    )
    monkeypatch.setattr(
        generation_service,
        "post_platform_credit_usage",
        lambda provider, entries, token: captured.update(entries=entries),
    )

    request = LLMGenerationRequest(
        provider="openai",
        model="gpt-4o",
        input="Summarize this invoice.",
        ref_type="Agent",
        ref_id="ref-1",
        ref_name=AGENT_NAME,
        action="AgentExecution",
    )
    response = LLMGenerationResponse(
        provider="openai",
        model="gpt-4o",
        output="Summary.",
        input_tokens=10,
        output_tokens=5,
    )

    generation_service._post_credit_usage(
        request, response, SimpleNamespace(access_token="jwt", space_id="space-1")
    )

    entries = captured["entries"]
    assert len(entries) == 2
    assert {entry["RefName"] for entry in entries} == {AGENT_NAME}
    assert {entry["TriggeredByAgent"] for entry in entries} == {AGENT_NAME}


def test_text_generation_byok_entries_carry_ref_name_in_both_columns(monkeypatch):
    captured = {}
    monkeypatch.setattr(
        generation_service,
        "get_credit_service_type",
        lambda provider, model, kind: f"Gpt4o{kind.title()}",
    )
    monkeypatch.setattr(
        generation_service,
        "post_byok_usage",
        lambda provider, entries, token: captured.update(entries=entries),
    )

    request = LLMGenerationRequest(
        provider="openai",
        model="gpt-4o",
        input="Summarize this invoice.",
        ref_type="Agent",
        ref_id="ref-1",
        ref_name=AGENT_NAME,
        action="AgentExecution",
        is_byok_enabled=True,
        credential_name="my-key",
    )
    response = LLMGenerationResponse(
        provider="openai",
        model="gpt-4o",
        output="Summary.",
        input_tokens=10,
        output_tokens=5,
    )

    generation_service._post_byok_usage(
        request, response, SimpleNamespace(access_token="jwt", space_id="space-1")
    )

    entries = captured.get("entries") or []
    assert entries
    assert {entry["RefName"] for entry in entries} == {AGENT_NAME}
    assert {entry["TriggeredByAgent"] for entry in entries} == {AGENT_NAME}


def test_embedding_entries_record_no_triggering_agent(monkeypatch):
    captured = {}
    monkeypatch.setattr(embedding_service, "agent_has_fixed_credits", lambda ref_id, token: False)
    monkeypatch.setattr(
        embedding_service,
        "get_credit_service_type",
        lambda provider, model, kind: "OpenAIEmbedding3Small",
    )
    monkeypatch.setattr(
        embedding_service,
        "post_platform_credit_usage",
        lambda provider, entries, token: captured.update(entries=entries),
    )

    request = EmbeddingRequest(
        provider="openai",
        model="text-embedding-3-small",
        input="invoice text",
        reference_id="kb-1",
        reference_type="Agent",
        reference_name="Invoices KB",
        action="Ingestion",
    )
    response = EmbeddingResponse(
        provider="openai",
        model="text-embedding-3-small",
        embeddings=[[0.1, 0.2]],
        input_tokens=7,
    )

    embedding_service.EmbeddingService._post_credit_usage(
        None, request, response, SimpleNamespace(access_token="jwt", space_id="space-1")
    )

    entry = captured["entries"][0]
    assert entry["RefName"] == "Invoices KB"
    assert entry["TriggeredByAgent"] is None


def test_agent_flow_credit_entries_carry_ref_name_in_both_columns():
    request = LLMRequest(
        provider="openai",
        model="gpt-4o",
        input="Summarize this invoice.",
        ref_type="Agent",
        ref_id="ref-1",
        ref_name=AGENT_NAME,
        action="AgentExecution",
    )
    service_map = credit_usage_service.CreditServiceMap(
        input="Gpt4oInput", output="Gpt4oOutput", cache="Gpt4oCached"
    )
    usage = credit_usage_service.TokenUsage(input=10, output=5, cached=3)

    entries = credit_usage_service._build_credit_usage_entries(
        request, service_map, usage, "space-1"
    )

    assert entries
    assert {entry["TriggeredByAgent"] for entry in entries} == {AGENT_NAME}
    assert {entry["RefName"] for entry in entries} == {AGENT_NAME}


def _capture_outlook_agent_data(monkeypatch):
    captured = {}

    async def fake_execute_agent(user, agent_data, endpoint, method):
        captured["agent_data"] = agent_data
        return {"status": "success", "response": {}}

    monkeypatch.setattr(outlook_client, "execute_agent", fake_execute_agent)
    return captured


def _send_email(ref_name):
    return asyncio.run(
        outlook_client.send_email_via_outlook(
            user=SimpleNamespace(access_token="jwt"),
            credential_name="outlook-cred",
            to="someone@example.com",
            subject="Subject",
            body="Body",
            from_address="sender@example.com",
            agent_name=ref_name,
        )
    )


def test_outlook_payload_uses_the_ref_name_value(monkeypatch):
    captured = _capture_outlook_agent_data(monkeypatch)

    _send_email(AGENT_NAME)

    assert captured["agent_data"]["agentName"] == AGENT_NAME


def test_outlook_payload_keeps_the_placeholder_default(monkeypatch):
    captured = _capture_outlook_agent_data(monkeypatch)

    _send_email(None)

    assert captured["agent_data"]["agentName"] == "HR_Advisor"
