"""Conversation identity and channel persistence contract tests."""

from __future__ import annotations

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID

from langchain_core.messages import HumanMessage

from app.features.auth.authenticated_user import User
from app.features.langgraph.checkpoint.models import Conversation
from app.features.langgraph.checkpoint.persistence import (
    attach_voice_turn_timing,
    ensure_conversation,
    update_conversation_status,
)
from app.features.langgraph.services.conversation_service import ConversationService
from app.features.llm_providers.llm_providers_schemas import LLMRequest


TENANT_ID = UUID("11111111-1111-1111-1111-111111111111")
USER_ID = UUID("22222222-2222-2222-2222-222222222222")
FLOW_ID = "33333333-3333-3333-3333-333333333333"
FLOW_VERSION_ID = "44444444-4444-4444-4444-444444444444"
CONVERSATION_ID = "55555555-5555-5555-5555-555555555555"


def _user() -> User:
    return User(
        user_id=USER_ID,
        username="tester",
        email="tester@example.com",
        roles=[],
        tenant_id=TENANT_ID,
    )


def _request(**overrides) -> LLMRequest:
    payload = {
        "provider": "openai",
        "model": "gpt-4o-mini",
        "input": "hello",
        "ref_id": FLOW_ID,
    }
    payload.update(overrides)
    return LLMRequest(**payload)


def test_conversation_service_prefers_flow_version_and_channel():
    async def run() -> None:
        db_session = AsyncMock()
        request = _request(flow_version_id=FLOW_VERSION_ID, channel="voice")
        service = ConversationService()

        with (
            patch(
                "app.features.langgraph.services.conversation_service.ensure_conversation",
                new=AsyncMock(),
            ) as ensure,
            patch(
                "app.features.langgraph.services.conversation_service._save_message",
                new=AsyncMock(),
            ),
        ):
            await service.save_message(
                db_session=db_session,
                request=request,
                user=_user(),
                conversation_id=CONVERSATION_ID,
                message=HumanMessage(content="hello"),
            )

        assert ensure.call_args.kwargs["flow_version_id"] == FLOW_VERSION_ID
        assert ensure.call_args.kwargs["channel"] == "voice"

    asyncio.run(run())


def test_conversation_service_falls_back_to_parent_flow_for_legacy_chat():
    async def run() -> None:
        db_session = AsyncMock()
        service = ConversationService()

        with (
            patch(
                "app.features.langgraph.services.conversation_service.ensure_conversation",
                new=AsyncMock(),
            ) as ensure,
            patch(
                "app.features.langgraph.services.conversation_service._save_message",
                new=AsyncMock(),
            ),
        ):
            await service.save_message(
                db_session=db_session,
                request=_request(),
                user=_user(),
                conversation_id=CONVERSATION_ID,
                message=HumanMessage(content="hello"),
            )

        assert ensure.call_args.kwargs["flow_version_id"] == FLOW_ID
        assert ensure.call_args.kwargs["channel"] == "chat"

    asyncio.run(run())


def test_voice_request_without_flow_version_never_records_the_parent_flow():
    async def run() -> None:
        db_session = AsyncMock()

        with (
            patch(
                "app.features.langgraph.services.conversation_service.ensure_conversation",
                new=AsyncMock(),
            ) as ensure,
            patch(
                "app.features.langgraph.services.conversation_service._save_message",
                new=AsyncMock(),
            ),
        ):
            await ConversationService().save_message(
                db_session=db_session,
                request=_request(is_voice_agent=True, channel="voice"),
                user=_user(),
                conversation_id=CONVERSATION_ID,
                message=HumanMessage(content="hello"),
            )

        assert ensure.call_args.kwargs["flow_version_id"] == ""

    asyncio.run(run())


def test_existing_conversation_channel_is_not_overwritten():
    async def run() -> None:
        existing = SimpleNamespace(channel="chat")
        result = MagicMock()
        result.scalar_one_or_none.return_value = existing
        session = AsyncMock()
        session.execute.return_value = result

        await ensure_conversation(
            session=session,
            tenant_id=TENANT_ID,
            user_id=USER_ID,
            conversation_id=CONVERSATION_ID,
            flow_version_id=FLOW_VERSION_ID,
            channel="voice",
            audit_user_id=USER_ID,
        )

        assert existing.channel == "chat"
        session.add.assert_not_called()

    asyncio.run(run())


def test_voice_turn_timing_merges_into_the_latest_assistant_transcript():
    async def run() -> None:
        record = SimpleNamespace(
            message_metadata={
                "ui_transcript": True,
                "frames": [{"type": "delta", "output": "Hi"}],
                "usage_metadata": {"input_tokens": 4},
            }
        )
        result = MagicMock()
        result.scalar_one_or_none.return_value = record
        session = AsyncMock()
        session.execute.return_value = result

        updated = await attach_voice_turn_timing(
            session=session,
            conversation_id=CONVERSATION_ID,
            timing={
                "stt_ms": 90,
                "llm_first_token_ms": 120,
                "tts_first_audio_ms": 300,
                "turn_total_ms": 700,
            },
        )

        assert updated is True
        assert record.message_metadata["ui_transcript"] is True
        assert record.message_metadata["frames"] == [{"type": "delta", "output": "Hi"}]
        assert record.message_metadata["usage_metadata"] == {"input_tokens": 4}
        assert record.message_metadata["voice_turn_timing"]["tts_first_audio_ms"] == 300

        record.message_metadata = {
            "ui_transcript": True,
            "voice_turn_timing": {"stt_ms": 1},
        }
        updated = await attach_voice_turn_timing(
            session=session,
            conversation_id=CONVERSATION_ID,
            timing={"stt_ms": 999},
        )

        assert updated is False
        assert record.message_metadata["voice_turn_timing"] == {"stt_ms": 1}

    asyncio.run(run())


def test_terminal_conversation_status_is_written_once():
    async def run() -> None:
        conversation = SimpleNamespace(status="active", last_modified_on=None)
        session = AsyncMock()
        session.get.return_value = conversation

        updated = await update_conversation_status(
            session=session,
            conversation_id=CONVERSATION_ID,
            status="Failed",
            audit_user_id=USER_ID,
        )

        assert updated is True
        assert conversation.status == "Failed"
        assert conversation.last_modified_by_user_id == USER_ID
        session.get.reset_mock()
        session.get.return_value = SimpleNamespace(status="Completed")

        updated = await update_conversation_status(
            session=session,
            conversation_id=CONVERSATION_ID,
            status="Failed",
            audit_user_id=USER_ID,
        )

        assert updated is False
        assert session.get.return_value.status == "Completed"

    asyncio.run(run())


def test_new_conversation_uses_supplied_channel():
    async def run() -> None:
        result = MagicMock()
        result.scalar_one_or_none.return_value = None
        session = AsyncMock()
        session.add = MagicMock()
        session.execute.return_value = result

        await ensure_conversation(
            session=session,
            tenant_id=TENANT_ID,
            user_id=USER_ID,
            conversation_id=CONVERSATION_ID,
            flow_version_id=FLOW_VERSION_ID,
            channel="voice",
            audit_user_id=USER_ID,
        )

        created = session.add.call_args.args[0]
        assert isinstance(created, Conversation)
        assert created.id == UUID(CONVERSATION_ID)
        assert created.channel == "voice"
        assert created.flow_version_id == UUID(FLOW_VERSION_ID)

    asyncio.run(run())
