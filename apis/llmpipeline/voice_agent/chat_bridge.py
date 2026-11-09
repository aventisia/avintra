"""In-process bridge from one LiveKit voice turn to the LangGraph chat engine.

The engine owns the conversation: it resolves the persona, knowledge base,
skills, tools, memory window, and persisted history for the conversation, and
it executes every tool call exactly once. The voice runtime only supplies the
latest caller transcript and consumes the normalized frames as speech.
"""

from __future__ import annotations

import asyncio
from collections.abc import AsyncIterator, Awaitable, Callable
from dataclasses import dataclass, field
from typing import Any

from app.core.config import settings
from app.core.database import get_db_session_context
from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.langgraph.services.chat_service import ChatService, chat_service
from app.features.llm_providers.llm_kb_retrieval import retrieve_and_inject_kb_context
from app.features.llm_providers.llm_providers_schemas import (
    LLMRequest,
    ToolAction,
    ToolConfig,
)

from .metadata import VoiceJobClaims
from .stt_adapter import build_user

VOICE_FALLBACK_APOLOGY = "Sorry, I could not finish that answer. Please try again."
VOICE_APPROVAL_APOLOGY = (
    "Sorry, I cannot run that action in this call. Please try a different request."
)

RetrieveKnowledgeBase = Callable[[LLMRequest, User], Awaitable[None]]


@dataclass(frozen=True)
class VoiceTurnFrame:
    """One mapped engine frame for the voice runtime."""

    kind: str
    text: str = ""
    payload: Any = field(default=None)


def build_voice_llm_request(
    claims: VoiceJobClaims,
    agent_settings: dict,
    transcript: str,
) -> LLMRequest:
    """Build this turn's request from the resolved S2 settings."""

    llm = agent_settings.get("llm") or {}
    knowledge_base = agent_settings.get("knowledgeBase") or {}
    memory = agent_settings.get("memory") or {}
    agent_name = agent_settings.get("agentName") or ""
    voice_system_prompt = _voice_system_prompt(agent_settings)
    kb_names = knowledge_base.get("names") or None
    manager_target = (agent_settings.get("managerAgentTarget") or "").strip()

    manager_agent = None
    if manager_target:
        manager_agent = {
            "target": manager_target,
            "context": {
                "current_turn_summary": transcript,
                "voice_system_prompt": voice_system_prompt,
                "conversation_id": claims.conversation_id,
            },
        }

    return LLMRequest(
        provider=llm.get("provider") or "",
        model=llm.get("model") or "",
        input=transcript,
        tool_config=_tool_config(agent_settings.get("tools") or []),
        is_chat_agent=True,
        is_voice_agent=True,
        first_speaker=agent_settings.get("firstSpeaker") or "human",
        introduction_text=agent_settings.get("introduction"),
        voice_system_prompt=voice_system_prompt,
        manager_agent=manager_agent,
        pronunciations=_pronunciations(agent_settings.get("pronunciations") or []),
        sfx=_sound_effects(agent_settings.get("soundEffects")),
        stream=True,
        is_temp_chat=claims.mode == "test",
        conversation_id=claims.conversation_id,
        temperature=llm.get("temperature", 1),
        top_p=llm.get("topP", 1),
        reasoning_effort=llm.get("reasoningEffort"),
        is_byok_enabled=bool(llm.get("isByokEnabled")),
        credential_name=llm.get("credentialName") or None,
        max_output_tokens=llm.get("maxOutputTokens"),
        kb_names=kb_names,
        top_k=knowledge_base.get("topK") if kb_names else None,
        source_threshold=knowledge_base.get("sourceThreshold") if kb_names else None,
        skill_names=agent_settings.get("skills") or None,
        max_short_term_turns=memory.get("maxShortTermTurns"),
        flow_version_id=str(claims.flow_version_id),
        channel="voice",
        ref_type="Agent",
        ref_id=str(claims.flow_id),
        ref_name=agent_name,
        action="AgentExecution",
        agent_name=agent_name or None,
    )


def _voice_system_prompt(agent_settings: dict) -> str | None:
    """Compose the persona with the S1 guidance even when the API omitted it."""

    persona = agent_settings.get("persona") or {}
    prompt = (persona.get("systemPrompt") or "").strip()
    guidance = (agent_settings.get("spokenStyleGuidance") or "").strip()
    if guidance and guidance not in prompt:
        prompt = f"{prompt}\n\n{guidance}".strip()
    return prompt or None


def _tool_config(tools: list[dict]) -> list[ToolConfig] | None:
    configs: list[ToolConfig] = []
    for tool in tools:
        name = (tool.get("tool") or "").strip()
        if not name:
            continue
        actions = [
            ToolAction(
                action=action.get("action") or "",
                approval=(
                    "auto"
                    if str(action.get("approval") or "").strip().lower() == "auto"
                    else "human"
                ),
            )
            for action in tool.get("actions") or []
            if action.get("action")
        ]
        configs.append(
            ToolConfig(
                tool=name,
                credential_name=tool.get("credentialName") or None,
                actions=actions,
            )
        )
    return configs or None


def _pronunciations(entries: list[dict]) -> list[dict] | None:
    pronunciations = [
        {"term": entry.get("term"), "pronunciation": entry.get("pronunciation")}
        for entry in entries
        if entry.get("term") and entry.get("pronunciation")
    ]
    return pronunciations or None


def _sound_effects(settings_: dict | None) -> dict | None:
    if not settings_:
        return None
    enabled = bool(settings_.get("enabled"))
    cue_url = settings_.get("toolCallCueUrl")
    ambience_url = settings_.get("ambienceUrl")
    if not enabled and not cue_url and not ambience_url:
        return None
    return {
        "enabled": enabled,
        "tool_call_cue_url": cue_url,
        "ambience_url": ambience_url,
    }


class VoiceChatBridge:
    """Run one caller turn through the chat engine and map its frames."""

    def __init__(
        self,
        claims: VoiceJobClaims,
        agent_settings: dict,
        *,
        service: ChatService | None = None,
        retrieve_kb: RetrieveKnowledgeBase | None = None,
    ) -> None:
        self._claims = claims
        self._agent_settings = agent_settings
        self._user = build_user(claims)
        self._service = service or chat_service
        self._retrieve_kb = retrieve_kb or retrieve_and_inject_kb_context

    async def stream_turn(self, transcript: str) -> AsyncIterator[VoiceTurnFrame]:
        """Stream one caller turn, always ending with exactly one ``done`` frame."""

        transcript = transcript.strip()
        if not transcript:
            yield VoiceTurnFrame(kind="delta", text=VOICE_FALLBACK_APOLOGY)
            yield VoiceTurnFrame(kind="done", payload=False)
            return

        spoken = False
        persisted = False
        approval_pending = False

        try:
            request = build_voice_llm_request(
                self._claims,
                self._agent_settings,
                transcript,
            )
            if request.kb_names:
                await self._retrieve_kb(request, self._user)

            async with get_db_session_context(
                settings.POSTGRESQL_WORKSPACE_DB_NAME,
            ) as session:
                async for chunk in self._service.stream_normalized(
                    request,
                    self._user,
                    db_session=session,
                ):
                    chunk_type = getattr(chunk, "type", None)
                    output = getattr(chunk, "output", None)

                    if chunk_type == "delta":
                        if isinstance(output, str) and output and not approval_pending:
                            spoken = True
                            yield VoiceTurnFrame(kind="delta", text=output)
                    elif chunk_type == "tool_call":
                        yield VoiceTurnFrame(kind="tool_call", payload=output)
                    elif chunk_type == "followup":
                        yield VoiceTurnFrame(kind="followup", payload=output)
                    elif chunk_type == "error":
                        yield VoiceTurnFrame(kind="error", text=str(output or ""))
                    elif chunk_type == "approval_required":
                        # IMPORTANT NOTE: the voice channel has no approval UI,
                        # so a paused tool call must never leave the turn open.
                        # Speak a fallback and keep consuming the engine stream so
                        # its transcript/persistence boundary still completes.
                        approval_pending = True
                        spoken = True
                        logger.warning(
                            "[voice-agent] tool approval requires a UI conversation=%s",
                            self._claims.conversation_id,
                        )
                        yield VoiceTurnFrame(
                            kind="error",
                            text="Voice turns cannot approve tool calls.",
                        )
                        yield VoiceTurnFrame(
                            kind="delta",
                            text=VOICE_APPROVAL_APOLOGY,
                        )
                    elif chunk_type == "done":
                        persisted = True
                        if (
                            not approval_pending
                            and not spoken
                            and isinstance(output, str)
                            and output
                        ):
                            spoken = True
                            yield VoiceTurnFrame(kind="delta", text=output)

                if not request.is_temp_chat:
                    await session.commit()
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception(
                "[voice-agent] chat engine turn failed conversation=%s",
                self._claims.conversation_id,
            )
            if not spoken:
                spoken = True
                yield VoiceTurnFrame(
                    kind="error",
                    text="The chat engine could not complete this turn.",
                )
                yield VoiceTurnFrame(kind="delta", text=VOICE_FALLBACK_APOLOGY)

        if not spoken:
            yield VoiceTurnFrame(kind="delta", text=VOICE_FALLBACK_APOLOGY)
        yield VoiceTurnFrame(kind="done", payload=persisted)
