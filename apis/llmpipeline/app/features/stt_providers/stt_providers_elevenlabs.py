import asyncio
import base64
import time
import httpx
import json
import websockets
import io
from pydub import AudioSegment

from fastapi import HTTPException

from app.core.config import settings
from app.core.logger import logger, log_exception
from app.core.vault_manager import VaultManager
from app.core.credit_manager import CreditManagerService
from app.core.byok_usage_manager import ByokUsageManager
from app.features.litellm.core.credentials import resolve_credential_name
from app.utils.file_converter_utils import file_to_base64
from app.features.auth.authenticated_user import User
from app.features.stt_providers.stt_providers_schema import (
    STTProviderRequest,
    STTProviderResponse,
    STTProviderStreamChunk
)
from app.features.stt_providers.stt_providers_base import BaseSpeechToTextProvider
from app.features.stt_providers.stt_providers_manager import active_stt_jobs


class ElevenLabsSTTProvider(BaseSpeechToTextProvider):
    def __init__(self):
        self.api_url = settings.ELEVENLABS_API_URL
        self.api_key = settings.ELEVENLABS_API_KEY

    # NON-STREAMING TRANSCRIPTION
    async def transcribe(
        self,
        stt_request: STTProviderRequest,
        user: User
    ) -> STTProviderResponse:

        logger.info(f"[NO STREAMING] ElevenLabs STT | model={stt_request.model}")

        # Create base response (important for consistency)
        base_response = self._create_initial_response(stt_request)
        start_time = time.perf_counter()

        try:
            # BYOK / CREDIT VALIDATION
            self._handle_auth_and_credits(stt_request, user)

            # BUILD REQUEST
            url = self._create_url("speech-to-text")
            headers = self._create_headers()
            files, data = self._create_request_payload(stt_request)
            # API CALL
            async with httpx.AsyncClient(timeout=300) as client:
                res = await client.post(
                    url,
                    headers=headers,
                    files=files,
                    data=data
                )
                res.raise_for_status()

            response_json = res.json()
            transcript = response_json.get("text", "")

            # FINAL RESPONSE
            return self._create_final_response(
                req=stt_request,
                base_response=base_response,
                start_time=start_time,
                transcript=transcript,
                raw_response=response_json,
                jwt=user.access_token,
                space_id=user.space_id,
            )

        except Exception as e:
            log_exception(logger, e, "ElevenLabs STT failure")

            base_response.status = "failed"
            base_response.error = str(e)

            logger.error(f"STT failed | model={stt_request.model} | error={str(e)}")

            return base_response

    # STREAMING TRANSCRIPTION
    async def stream_transcription(
        self,
        stt_request: STTProviderRequest,
        job_id: str,
        user: User
    ):
        logger.info(f"[STREAMING][WSS] ElevenLabs STT | model={stt_request.model}")

        # Prepare base response object
        base_response = self._create_initial_response(stt_request)
        start_time = time.perf_counter()

        try:
            # Handle authentication (BYOK) or validate user credits before making request
            self._handle_auth_and_credits(stt_request, user)

            # Handle audio input
            base64_uri = file_to_base64(stt_request.input)
        
            # Split into MIME type and base64 content
            header, base64_str = base64_uri.split(",", 1)
            mime_type = header.split(";")[0].replace("data:", "")

            # Start building query string with required parameter
            query = f"model_id={stt_request.model}"

            # Add language_code only if user provided it
            # If not provided, provider will use default / auto-detect
            if stt_request.language:
                query += f"&language_code={stt_request.language}"

            # Construct WebSocket URL with dynamic query parameters
            # Replace https with wss for WebSocket connection
            url = self._create_url(
                f"speech-to-text/realtime?{query}"
            ).replace("https://", "wss://")

            # Prepare request headers (includes API key or BYOK credentials)
            headers = self._create_headers()

            # Decode base64 into raw bytes for streaming
            audio_bytes = base64.b64decode(base64_str)

            if not isinstance(audio_bytes, (bytes, bytearray)):
                raise ValueError("Audio must be bytes")

            async with websockets.connect(
                url,
                additional_headers=headers
            ) as ws:

                full_text = ""

                # Send audio chunks
                async def send_audio():
                    try:
                        MAX_CHUNK = 800_000  # ~25 sec

                        for i in range(0, len(audio_bytes), MAX_CHUNK):
                            chunk = audio_bytes[i:i + MAX_CHUNK]

                            await ws.send(json.dumps({
                                "message_type": "input_audio_chunk",
                                "audio_base_64": base64.b64encode(chunk).decode(),
                                "sample_rate": 16000,
                                "commit": False
                            }))

                            await asyncio.sleep(0.05)

                        # ONLY ONE FINAL COMMIT
                        await ws.send(json.dumps({
                            "message_type": "input_audio_chunk",
                            "audio_base_64": "",
                            "sample_rate": 16000,
                            "commit": True
                        }))

                    except Exception as e:
                        log_exception(logger, e, "Audio send failure")
                        await ws.close()

                # Start sender
                send_task = asyncio.create_task(send_audio())

                # Receive messages
                async for message in ws:
                    if job_id not in active_stt_jobs:
                        await ws.close()
                        break

                    try:
                        data = json.loads(message)
                        msg_type = data.get("message_type")

                        if not msg_type:
                            continue

                        if msg_type == "partial_transcript":
                            text = data.get("text", "")
                            if not text:
                                continue

                            yield STTProviderStreamChunk(
                                provider=stt_request.provider,
                                model=stt_request.model,
                                request_id=job_id,
                                output=text,
                                is_final=False,
                                ref_id=stt_request.ref_id,
                                ref_type=stt_request.ref_type,
                                agent_name=stt_request.agent_name,
                                action=stt_request.action
                            ).model_dump_json() + "\n"

                        elif msg_type in [
                            "committed_transcript",
                            "committed_transcript_with_timestamps"
                        ]:
                            text = data.get("text", "")
                            if not text:
                                continue

                            full_text += text + " "

                            yield STTProviderStreamChunk(
                                provider=stt_request.provider,
                                model=stt_request.model,
                                request_id=job_id,
                                output=text,
                                is_final=True,
                                ref_id=stt_request.ref_id,
                                ref_type=stt_request.ref_type,
                                agent_name=stt_request.agent_name,
                                action=stt_request.action
                            ).model_dump_json() + "\n"

                    except Exception as err:
                        log_exception(logger, err, "WS parse error")

                # WAIT FOR SENDER FINISH
                await send_task

                # final full audio
                final_response = self._create_final_response(
                    req=stt_request,
                    base_response=base_response,
                    start_time=start_time,
                    transcript=full_text,
                    jwt=user.access_token,
                    space_id=user.space_id,
                )
                
                yield final_response.model_dump_json() + "\n"

        except Exception as e:
            log_exception(logger, e, "Streaming failure")

            yield json.dumps({
                "error": str(e),
                "request_id": job_id
            }) + "\n"

    # AUTH / CREDIT HANDLING
    def _handle_auth_and_credits(self, req: STTProviderRequest, user: User):
        """
        Handles BYOK or credit validation
        """

        if req.is_byok_enabled and req.credential_name:
            vault = VaultManager()

            credential = vault.get_vault_secret_by_name(
                credential=req.credential_name,
                jwt=user.access_token,
                env_type=user.env_type,
            )

            if not credential:
                logger.error("Invalid BYOK credentials")
                raise HTTPException(400, "Invalid credential name")

            credential_data = credential.get("data") or credential
            self.api_url = credential_data.get("Host") or credential_data.get("Url")
            self.api_key = credential_data.get("ApiKey")

            if not self.api_url or not self.api_key:
                raise HTTPException(400, "Invalid credential name")

        else:
            credit_manager = CreditManagerService()

            if not credit_manager.has_sufficient_credits(
                task="elevenlabs",
                jwt=user.access_token
            ):
                logger.warning("Insufficient credits for ElevenLabs")
                raise HTTPException(400, "Insufficient credits")

    # REQUEST BUILDERS
    def _create_url(self, endpoint: str) -> str:
        return f"{self.api_url.rstrip('/')}/{endpoint}"

    def _create_headers(self) -> dict:
        return {
            "xi-api-key": self.api_key
        }

    def _create_request_payload(self, req: STTProviderRequest):

        # Handle audio input
        base64_uri = file_to_base64(req.input)

        # Split into MIME type and base64 content
        header, base64_str = base64_uri.split(",", 1)
        mime_type = header.split(";")[0].replace("data:", "")

        # Decode to bytes
        file_bytes = base64.b64decode(base64_str)

        # Prepare multipart file payload for API request
        files = {
            "file": ("audio", file_bytes, mime_type)
        }

        # Base form data with required model identifier
        data = {
            "model_id": req.model
        }

        # Include language_code only if explicitly provided
        if req.language:
            data["language_code"] = req.language

        return files, data

    # RESPONSE BUILDERS
    def _create_initial_response(self, req: STTProviderRequest) -> STTProviderResponse:
        return STTProviderResponse(
            provider=req.provider,
            model=req.model,
            status="processing",
            output="",
            stream=req.stream,
            language=req.language,
            credentials_id=req.credential_name,
            is_byok_enabled=req.is_byok_enabled,
            ref_id=req.ref_id,
            ref_type=req.ref_type,
            agent_name=req.agent_name,
            action=req.action,
            error=None
        )

    def _create_final_response(
        self,
        req: STTProviderRequest,
        base_response: STTProviderResponse,
        start_time: float,
        transcript: str,
        raw_response: dict = None,
        jwt: str = None,
        space_id: str = None
    ) -> STTProviderResponse:

        end_time = time.perf_counter()

        # BASIC RESPONSE FIELDS
        base_response.status = "completed"
        base_response.output = transcript
        base_response.time_taken = round(end_time - start_time, 2)
        base_response.token_count = self.get_audio_duration(req.input)

        # CREDIT USAGE (NON-BYOK)
        if not req.is_byok_enabled and not req.credential_name:
            try:
                credit_manager = CreditManagerService()
                
                # Mapping of request model names to internal service type identifiers
                # This ensures consistent naming for billing/reporting
                STT_MODEL_MAP = {
                    "scribe_v2", "ElevenLabsScribeV2",
                    "scribe_v2_realtime", "ElevenLabsScribeV2Realtime",
                    "scribe_v1", "ElevenLabsScribeV1",
                }

                # Resolve the internal service type based on requested model
                service_type = STT_MODEL_MAP.get(req.model)
                
                # Validate model support to avoid silent billing errors
                if not service_type:
                    raise ValueError(f"Unsupported TTS model: {req.model}")
                
                credit_usage = {
                    "ServiceType": service_type,
                    "ConsumedUnit": base_response.token_count,
                    "RefType": req.ref_type,
                    "RefId": req.ref_id,
                    "RefName": req.ref_name,
                    "Action": req.action,
                    "TriggeredByAgent": req.agent_name,
                    "SpaceId": space_id,
                }

                credit_manager.post_credit_usage(
                    task="elevenlabs",
                    request=credit_usage,
                    jwt=jwt
                )

                logger.info(f"STT credit usage posted | ref_id={req.ref_id}")

            except Exception as e:
                logger.error(f"Failed to post STT credit usage | error={str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to post credit usage: {str(e)}"
                )

        # BYOK USAGE (caller's own key)
        elif req.is_byok_enabled and req.credentials_id:
            try:
                byok_manager = ByokUsageManager()

                # Mapping of request model names to internal service type identifiers
                STT_MODEL_MAP = {
                    "scribe_v2": "ElevenLabsScribeV2",
                    "scribe_v2_realtime": "ElevenLabsScribeV2Realtime",
                    "scribe_v1": "ElevenLabsScribeV1",
                }

                # Resolve the internal service type based on requested model
                service_type = STT_MODEL_MAP.get(req.model)

                # Validate model support to avoid silent recording errors
                if not service_type:
                    raise ValueError(f"Unsupported STT model: {req.model}")

                # Resolve the vault credential name for attribution
                credential_name = resolve_credential_name(req.credentials_id, jwt=jwt)

                byok_usage = {
                    "ServiceType": service_type,
                    "Provider": req.provider,
                    "Model": req.model,
                    "ConsumedUnit": base_response.token_count,
                    "UnitType": "Seconds",
                    "CredentialId": req.credentials_id,
                    "CredentialName": credential_name,
                    "RefType": req.ref_type,
                    "RefId": req.ref_id,
                    "RefName": req.ref_name,
                    "Action": req.action,
                    "TriggeredByAgent": req.agent_name,
                    "SpaceId": space_id,
                }

                byok_manager.post_byok_usage(
                    task="elevenlabs",
                    request=byok_usage,
                    jwt=jwt
                )

                logger.info(f"STT BYOK usage posted | ref_id={req.ref_id}")

            except Exception as e:
                logger.error(f"Failed to post STT BYOK usage | error={str(e)}")

        return base_response

    def get_audio_duration(self, base64_str: str) -> float:
        try:
            # Remove base64 header if present
            if "," in base64_str:
                base64_str = base64_str.split(",", 1)[1]

            # Decode base64
            audio_bytes = base64.b64decode(base64_str)

            # Load audio (auto-detect format via ffmpeg)
            audio = AudioSegment.from_file(io.BytesIO(audio_bytes))

            # Return duration in seconds
            return len(audio) / 1000.0

        except Exception as e:
            raise ValueError(f"Failed to process audio: {e}")