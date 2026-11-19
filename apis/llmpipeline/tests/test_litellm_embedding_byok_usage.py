"""Embedding BYOK usage tests: attribution uses the vault display name.

Run from ``apis/llmpipeline``:

    python -m pytest tests/test_litellm_embedding_byok_usage.py -q
"""

from __future__ import annotations

import pytest

import app.features.litellm.embeddings.embedding_service as embedding_module
from app.features.litellm.core.schemas import EmbeddingRequest, EmbeddingResponse


class _FakeUser:
    access_token = "fake-jwt"
    space_id = "space-1"


@pytest.fixture(autouse=True)
def _capture_usage(monkeypatch):
    posted: list[dict] = []
    monkeypatch.setattr(
        embedding_module, "resolve_credential_name", lambda *_args, **_kwargs: "My Key"
    )
    monkeypatch.setattr(
        embedding_module, "post_byok_usage", lambda _provider, entries, _token: posted.extend(entries)
    )
    return posted


def test_byok_entry_carries_the_resolved_display_name(_capture_usage):
    request = EmbeddingRequest(
        provider="openai",
        model="text-embedding-3-small",
        input="hi",
        credential_name="openai-key",
    )
    response = EmbeddingResponse(
        provider="openai", model="text-embedding-3-small", embeddings=[], input_tokens=12
    )

    embedding_module.embedding_service._post_byok_usage(request, response, _FakeUser())

    assert [entry["CredentialName"] for entry in _capture_usage] == ["My Key"]
    assert [entry["SpaceId"] for entry in _capture_usage] == ["space-1"]
