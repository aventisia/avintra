"""A normalized chat stream that fails mid-reply must end with an error frame."""

import asyncio
import json
from contextlib import asynccontextmanager
from unittest.mock import MagicMock, patch

from fastapi import HTTPException

from app.features.langgraph.graphs import langraph_routes as routes
from app.features.llm_providers.llm_providers_schemas import LLMChunkResponse


@asynccontextmanager
async def _fake_session(*_args, **_kwargs):
    yield MagicMock()


def _request():
    request = MagicMock()
    request.credential_name = None
    request.conversation_id = "conv-1"
    request.kb_names = None
    request.is_temp_chat = True
    request.provider = "openai"
    request.model = "gpt-test"
    return request


def _frames(failure: Exception):
    async def failing_stream(*_args, **_kwargs):
        yield LLMChunkResponse(provider="openai", model="gpt-test", output="Hel", type="delta")
        raise failure

    async def collect():
        with (
            patch.object(routes.chat_service, "stream_normalized", side_effect=failing_stream),
            patch.object(routes, "get_db_session_context", _fake_session),
        ):
            response = await routes.generate_langgraph_response_normalized_route(
                _request(), MagicMock()
            )
            return [chunk async for chunk in response.body_iterator]

    return [json.loads(frame.removeprefix("data: ").strip()) for frame in asyncio.run(collect())]


def test_value_error_is_sent_as_error_frame_after_partial_text():
    frames = _frames(ValueError("Missing API key for openai."))

    assert frames[0]["type"] == "delta"
    assert frames[-1]["type"] == "error"
    assert frames[-1]["output"] == "Missing API key for openai."


def test_credential_failure_is_sent_as_configuration_message():
    frames = _frames(HTTPException(status_code=400, detail="av_anthropic_api_key unavailable"))

    assert frames[-1]["type"] == "error"
    assert frames[-1]["output"] == routes.CREDENTIAL_STREAM_ERROR_MESSAGE
    assert "av_anthropic_api_key" not in frames[-1]["output"]


def test_unexpected_error_is_sent_with_generic_message():
    frames = _frames(RuntimeError("secret internals"))

    assert frames[-1]["type"] == "error"
    assert "secret" not in frames[-1]["output"]
    assert frames[-1]["output"] == "The assistant couldn't finish this reply. Please try again."
