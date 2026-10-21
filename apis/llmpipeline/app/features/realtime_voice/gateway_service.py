"""Realtime voice gateway: cookie auth, per-connect revalidation, and frame relay.

One WebSocket connection serves one provider session. Every connect revalidates
the JWT, the executable-provider allowlist, the BYOK credential, and the tenant's
Realtime-enabled model before any provider traffic flows.
"""
from __future__ import annotations

import asyncio
import base64
import json
from typing import Awaitable, Callable, Optional

import httpx
from fastapi import HTTPException, WebSocket, WebSocketDisconnect

from app.core.config import settings
from app.core.jwt_helper import get_user_from_jwt
from app.core.logger import logger
from app.features.auth.authenticated_user import User
from app.features.litellm.core.credentials import resolve_credentials
from app.features.litellm.core.provider_registry import (
    build_litellm_model,
    normalize_provider,
    validate_model,
    validate_provider,
)

from .provider_transport import (
    INPUT_TRANSCRIPTION_MODEL_BY_PROVIDER,
    ProviderAudio,
    ProviderConnector,
    RealtimeProviderError,
    RealtimeProviderSession,
    open_provider_session,
)
from .schemas import (
    CANONICAL_SAMPLE_RATE,
    ERROR_CODE_CREDENTIALS_UNAVAILABLE,
    ERROR_CODE_INVALID_CONFIG,
    ERROR_CODE_INVALID_FRAME,
    ERROR_CODE_MODEL_NOT_ENABLED,
    ERROR_CODE_UNSUPPORTED_MODEL,
    ERROR_CODE_UNSUPPORTED_PROVIDER,
    ERROR_CODE_UPSTREAM,
    REALTIME_PROVIDERS,
    WS_CLOSE_BAD_CONFIG,
    WS_CLOSE_FORBIDDEN,
    WS_CLOSE_NORMAL,
    WS_CLOSE_UNAUTHORIZED,
    WS_CLOSE_UPSTREAM_FAILURE,
    ErrorFrame,
    InputAudioChunkFrame,
    OutputAudioChunkFrame,
    SessionClosedFrame,
    SessionReadyFrame,
    SessionStartFrame,
    SessionStopFrame,
    TranscriptDeltaFrame,
    parse_client_frame,
)

_BACKEND_PROVIDER_TYPES: dict[str, set[str]] = {
    "openai": {"OpenAI"},
    "azure": {"Azure"},
    "gemini": {"Gemini"},
    "vertex_ai": {"VertexAi"},
    "xai": {"Xai"},
    "bedrock": {"Bedrock", "AmazonNova"},
}


def _workspace_api_base_url() -> str:
    default = f"https://{settings.APP_BASE_URL}/api"
    return getattr(settings, "WORKSPACE_API_URL", None) or default


async def is_model_enabled_for_tenant(provider: str, model: str, user: User) -> bool:
    """Return whether the tenant has the model enabled for the Realtime capability."""
    provider_types = _BACKEND_PROVIDER_TYPES.get(provider)
    if not provider_types:
        return False

    url = f"{_workspace_api_base_url().rstrip('/')}/tenant-model-provider/enabled-models"
    headers = {"X-Env-Type": user.env_type or "dev"}
    if user.space_id:
        headers["X-Space-Id"] = user.space_id
    if user.access_token:
        headers["Authorization"] = f"Bearer {user.access_token}"

    try:
        async with httpx.AsyncClient(timeout=10.0, verify=settings.SSL_VERIFY) as client:
            response = await client.get(url, params={"capability": "Realtime"}, headers=headers)
            response.raise_for_status()
            payload = response.json()
    except Exception as error:  # noqa: BLE001
        logger.warning(f"[REALTIME] Tenant model check failed: {error}")
        return False

    for entry in payload.get("data") or []:
        if entry.get("providerType") in provider_types and entry.get("modelId") == model:
            return True

    return False


class RealtimeGatewayService:
    """Serves a single realtime voice session per WebSocket connection."""

    def __init__(
        self,
        connector: ProviderConnector = open_provider_session,
        tenant_gate: Callable[[str, str, User], Awaitable[bool]] = is_model_enabled_for_tenant,
    ) -> None:
        self._connector = connector
        self._tenant_gate = tenant_gate

    async def handle(self, websocket: WebSocket) -> None:
        user = self._authenticate(websocket)
        if user is None:
            await self._close(websocket, WS_CLOSE_UNAUTHORIZED)
            return

        await websocket.accept()

        session: Optional[RealtimeProviderSession] = None
        try:
            start = await self._await_session_start(websocket)
            if start is None:
                return

            session = await self._open_session(websocket, start, user)
            if session is None:
                return

            if not await self._relay(websocket, session):
                await self._send_error(
                    websocket, ERROR_CODE_UPSTREAM, "The provider session ended unexpectedly.", retryable=True
                )
                await self._close(websocket, WS_CLOSE_UPSTREAM_FAILURE)
        except WebSocketDisconnect:
            return
        except RealtimeProviderError as error:
            await self._send_error(websocket, ERROR_CODE_UPSTREAM, str(error), retryable=error.retryable)
            await self._close(
                websocket, WS_CLOSE_UPSTREAM_FAILURE if error.retryable else WS_CLOSE_BAD_CONFIG
            )
        except Exception as error:  # noqa: BLE001
            logger.error(f"[REALTIME] Session failed: {error}", exc_info=True)
            await self._close(websocket, WS_CLOSE_UPSTREAM_FAILURE)
        finally:
            if session is not None:
                await session.close()

    def _authenticate(self, websocket: WebSocket) -> Optional[User]:
        token = websocket.cookies.get("AccessToken")
        if not token:
            return None

        try:
            user = get_user_from_jwt(token)
        except Exception as error:  # noqa: BLE001
            logger.warning(f"[REALTIME] Authentication failed: {error}")
            return None

        user.access_token = token
        user.space_id = websocket.query_params.get("space_id") or None
        user.env_type = websocket.query_params.get("env_type") or "dev"
        return user

    async def _await_session_start(self, websocket: WebSocket) -> Optional[SessionStartFrame]:
        raw = await websocket.receive_text()

        try:
            frame = parse_client_frame(json.loads(raw))
        except (ValueError, json.JSONDecodeError) as error:
            await self._reject(websocket, WS_CLOSE_BAD_CONFIG, ERROR_CODE_INVALID_FRAME, str(error))
            return None

        if not isinstance(frame, SessionStartFrame):
            await self._reject(
                websocket,
                WS_CLOSE_BAD_CONFIG,
                ERROR_CODE_INVALID_FRAME,
                "The first frame must be session.start.",
            )
            return None

        return frame

    @staticmethod
    def _validate_model(provider: str, model: str, credential_name: str) -> None:
        """Accept the configured model id or its provider-prefixed LiteLLM form."""
        try:
            validate_model(provider, model, is_byok=True, credential_name=credential_name)
        except HTTPException:
            validate_model(
                provider,
                build_litellm_model(provider, model),
                is_byok=True,
                credential_name=credential_name,
            )

    async def _open_session(
        self, websocket: WebSocket, start: SessionStartFrame, user: User
    ) -> Optional[RealtimeProviderSession]:
        provider = normalize_provider(start.provider)
        model = start.model.strip()

        if provider not in REALTIME_PROVIDERS:
            await self._reject(
                websocket,
                WS_CLOSE_BAD_CONFIG,
                ERROR_CODE_UNSUPPORTED_PROVIDER,
                f"Provider '{start.provider}' is not supported for realtime voice.",
            )
            return None

        if not model:
            await self._reject(
                websocket,
                WS_CLOSE_BAD_CONFIG,
                ERROR_CODE_INVALID_CONFIG,
                "A realtime model is required.",
            )
            return None

        if not start.credential_name.strip():
            await self._reject(
                websocket,
                WS_CLOSE_BAD_CONFIG,
                ERROR_CODE_INVALID_CONFIG,
                "Realtime voice requires a BYOK credential.",
            )
            return None

        try:
            validate_provider(provider, is_byok=True, credential_name=start.credential_name)
            self._validate_model(provider, model, start.credential_name)
        except HTTPException as error:
            await self._reject(
                websocket, WS_CLOSE_BAD_CONFIG, ERROR_CODE_INVALID_CONFIG, str(error.detail)
            )
            return None

        try:
            resolution = resolve_credentials(provider, True, start.credential_name, user)
        except HTTPException as error:
            await self._reject(
                websocket, WS_CLOSE_FORBIDDEN, ERROR_CODE_CREDENTIALS_UNAVAILABLE, str(error.detail)
            )
            return None

        if not await self._tenant_gate(provider, model, user):
            await self._reject(
                websocket,
                WS_CLOSE_FORBIDDEN,
                ERROR_CODE_MODEL_NOT_ENABLED,
                "The selected model is not enabled for realtime voice for this tenant.",
            )
            return None

        try:
            session = await self._connector(
                provider=provider,
                model=build_litellm_model(provider, model),
                credential_kwargs=resolution.kwargs,
                voice=start.voice,
                language=start.language,
                input_sample_rate=CANONICAL_SAMPLE_RATE,
            )
        except RealtimeProviderError as error:
            await self._send_error(websocket, ERROR_CODE_UPSTREAM, str(error), retryable=error.retryable)
            await self._close(
                websocket, WS_CLOSE_UPSTREAM_FAILURE if error.retryable else WS_CLOSE_BAD_CONFIG
            )
            return None
        except ValueError as error:
            await self._reject(
                websocket, WS_CLOSE_BAD_CONFIG, ERROR_CODE_UNSUPPORTED_MODEL, str(error)
            )
            return None

        await self._enable_input_transcription(provider, session)

        await websocket.send_text(
            SessionReadyFrame(
                provider=provider,
                model=model,
                output_sample_rate=session.output_sample_rate,
            ).model_dump_json()
        )
        return session

    async def _enable_input_transcription(
        self, provider: str, session: RealtimeProviderSession
    ) -> None:
        model = INPUT_TRANSCRIPTION_MODEL_BY_PROVIDER.get(provider)
        if not model:
            logger.warning(
                f"[REALTIME] input transcription unsupported for provider='{provider}'; "
                "continuing audio-only"
            )
            return

        try:
            await session.send_transcription_config(model)
        except Exception as error:  # noqa: BLE001
            logger.warning(
                f"[REALTIME] input transcription enablement failed for provider='{provider}': "
                f"{error}; continuing audio-only"
            )

    async def _relay(self, websocket: WebSocket, session: RealtimeProviderSession) -> bool:
        """Relay frames until either side ends. Returns True only on a graceful client stop."""
        provider_task = asyncio.create_task(self._relay_provider(websocket, session))
        client_task = asyncio.create_task(self._relay_client(websocket, session))

        done, pending = await asyncio.wait(
            {provider_task, client_task}, return_when=asyncio.FIRST_COMPLETED
        )
        stopped_by_client = (
            client_task in done
            and client_task.exception() is None
            and client_task.result() == "stopped"
        )
        for task in pending:
            task.cancel()
        await asyncio.gather(*pending, return_exceptions=True)
        for task in done:
            task.result()

        return stopped_by_client

    async def _relay_provider(self, websocket: WebSocket, session: RealtimeProviderSession) -> None:
        last_sent: dict[str, str] = {"user": "", "assistant": ""}

        async for event in session.events():
            if isinstance(event, ProviderAudio):
                frame = OutputAudioChunkFrame(
                    audio_base64=base64.b64encode(event.pcm).decode("ascii"),
                    sample_rate=event.sample_rate,
                )
                await websocket.send_text(frame.model_dump_json())
                continue

            role = event.role if event.role in last_sent else "assistant"
            text = event.text or ""

            if event.final:
                last_sent[role] = ""
                if not text.strip():
                    continue
                await websocket.send_text(
                    TranscriptDeltaFrame(text=text, final=True, role=role).model_dump_json()
                )
                continue

            previous = last_sent[role]
            last_sent[role] = text
            if previous and text.startswith(previous):
                text = text[len(previous) :]
            if not text:
                continue
            await websocket.send_text(
                TranscriptDeltaFrame(text=text, final=False, role=role).model_dump_json()
            )

    async def _relay_client(self, websocket: WebSocket, session: RealtimeProviderSession) -> str:
        while True:
            raw = await websocket.receive_text()

            try:
                frame = parse_client_frame(json.loads(raw))
            except (ValueError, json.JSONDecodeError) as error:
                await self._send_error(
                    websocket, ERROR_CODE_INVALID_FRAME, str(error), retryable=False
                )
                continue

            if isinstance(frame, SessionStopFrame):
                await session.close()
                await websocket.send_text(SessionClosedFrame().model_dump_json())
                await self._close(websocket, WS_CLOSE_NORMAL)
                return "stopped"

            if isinstance(frame, InputAudioChunkFrame):
                await session.send_audio(base64.b64decode(frame.audio_base64))
                if frame.commit:
                    await session.send_commit()
                continue

            await self._send_error(
                websocket,
                ERROR_CODE_INVALID_FRAME,
                "session.start is only valid as the first frame.",
                retryable=False,
            )

    async def _send_error(
        self, websocket: WebSocket, code: str, message: str, *, retryable: bool
    ) -> None:
        try:
            await websocket.send_text(
                ErrorFrame(code=code, message=message, retryable=retryable).model_dump_json()
            )
        except Exception:  # noqa: BLE001
            pass

    async def _reject(self, websocket: WebSocket, close_code: int, code: str, message: str) -> None:
        await self._send_error(websocket, code, message, retryable=False)
        await self._close(websocket, close_code)

    async def _close(self, websocket: WebSocket, code: int) -> None:
        try:
            await websocket.close(code=code)
        except Exception:  # noqa: BLE001
            pass


realtime_gateway_service = RealtimeGatewayService()
