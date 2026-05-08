import time
import httpx
import base64
from typing import AsyncGenerator

from fastapi import HTTPException

from app.core.config import settings
from app.core.logger import logger, log_exception
from app.core.vault_manager import VaultManager
from app.core.credit_manager import CreditManagerService

from app.features.auth.authenticated_user import User
from app.features.tts_providers.tts_providers_schema import (
    TTSProviderRequest,
    TTSProviderResponse,
    TTSProviderStreamChunk
)
from app.features.tts_providers.tts_providers_base import BaseTextToSpeechProvider
from app.features.tts_providers.tts_providers_manager import list_active_tts_jobs


class ElevenLabsTTSProvider(BaseTextToSpeechProvider):

    def __init__(self):
        # Load default API config
        self.api_url = settings.ELEVENLABS_API_URL
        self.api_key = settings.ELEVENLABS_API_KEY

    # Non-streaming: full audio response
    async def synthesize(
        self,
        tts_request: TTSProviderRequest,
        user: User
    ) -> TTSProviderResponse:

        logger.info(f"[NO STREAMING] ElevenLabs TTS | model={tts_request.model}")

        # Prepare base response object
        base_response = self._create_initial_response(tts_request)
        start_time = time.perf_counter()

        try:
            # Handle BYOK or credit validation
            self._handle_auth_and_credits(tts_request, user)

            # Build request
            url = self._create_url(f"text-to-speech/{tts_request.voice_id}")
                
            headers = self._create_headers()
            payload = self._create_request_payload(tts_request)

            # Call ElevenLabs API
            async with httpx.AsyncClient(timeout=300) as client:
                res = await client.post(url, headers=headers, json=payload)
                res.raise_for_status()

            # Convert binary audio to base64
            audio_base64 = base64.b64encode(res.content).decode("utf-8")

            # Build final response
            return self._create_final_response(
                tts_request,
                base_response,
                start_time,
                audio_base64,
                user.access_token
            )

        except Exception as e:
            # Log and return failure response
            log_exception(logger, e, "ElevenLabs TTS failure")

            base_response.status = "failed"
            base_response.error = str(e)

            logger.error(f"TTS failed | model={tts_request.model} | error={str(e)}")

            return base_response

    # Streaming: yield audio chunks
    async def stream_synthesis(
        self,
        tts_request: TTSProviderRequest,
        job_id: str,
        user: User
    ) -> AsyncGenerator[str, None]:

        logger.info(f"[STREAMING] ElevenLabs TTS | model={tts_request.model}")

        # Prepare base response object
        base_response = self._create_initial_response(tts_request)
        start_time = time.perf_counter()

        try:
            # Handle BYOK or credit validation
            self._handle_auth_and_credits(tts_request, user)

            # Build request
            url = self._create_url(f"text-to-speech/{tts_request.voice_id}/stream")
            headers = self._create_headers()
            headers["Content-Type"] = "application/json"

            payload = self._create_request_payload(tts_request)

            async with httpx.AsyncClient(timeout=None) as client:
                async with client.stream(
                    "POST",
                    url,
                    json=payload,
                    headers=headers
                ) as res:

                    res.raise_for_status()

                    sequence_id = 0
                    full_audio_bytes = bytearray()

                    # Read streaming audio chunks
                    async for chunk in res.aiter_bytes():

                        # Stop if job is cancelled
                        if job_id not in list_active_tts_jobs():
                            logger.info(f"TTS streaming cancelled | job={job_id}")
                            break

                        sequence_id += 1
                        # keep raw bytes
                        full_audio_bytes.extend(chunk)

                        # encode only for streaming
                        chunk_base64 = base64.b64encode(chunk).decode("utf-8")
                    
                        # Convert chunk to base64 and wrap in response schema
                        chunk_obj = TTSProviderStreamChunk(
                            provider=tts_request.provider,
                            model=tts_request.model,
                            request_id=job_id,
                            output=chunk_base64,
                            is_final=False,
                            ref_id=tts_request.ref_id,
                            ref_type=tts_request.ref_type,
                            agent_name=tts_request.agent_name,
                            action=tts_request.action
                        )
                        full_audio_bytes.extend(chunk)
                        yield chunk_obj.model_dump_json() + "\n"

                # final full audio
                final_audio_base64 = base64.b64encode(full_audio_bytes).decode("utf-8")

                final_response = self._create_final_response(
                    tts_request,
                    base_response,
                    start_time,
                    final_audio_base64,
                    user.access_token
                )
                
                yield final_response.model_dump_json() + "\n"

        except Exception as e:
            # Log error and send encoded error message
            log_exception(logger, e, "TTS streaming failure")

            yield base64.b64encode(str(e).encode()).decode() + "\n"

    # Handle BYOK or credit validation
    def _handle_auth_and_credits(self, req: TTSProviderRequest, user: User):

        # BYOK flow (use user-provided API key)
        if req.is_byok_enabled and req.credentials_id:
            vault = VaultManager()

            credential = vault.get_vault_secret_by_id(
                vault_secret_id=req.credentials_id,
                jwt=user.access_token
            )

            if not credential:
                logger.error("Invalid BYOK credentials")
                raise HTTPException(400, "Invalid credential_id")

            # Override API config from vault
            self.api_url = credential.get("data", {}).get("Host")
            self.api_key = credential.get("data", {}).get("ApiKey")

        else:
            # Credit-based usage check
            credit_manager = CreditManagerService()

            if not credit_manager.has_sufficient_credits(
                task="elevenlabs_tts",
                jwt=user.access_token
            ):
                logger.warning("Insufficient credits for TTS")
                raise HTTPException(400, "Insufficient credits")

    # Build full API URL
    def _create_url(self, endpoint: str) -> str:
        return f"{self.api_url.rstrip('/')}/{endpoint}"

    # Build request headers
    def _create_headers(self) -> dict:
        return {
            "xi-api-key": self.api_key,
            "Content-Type": "application/json"
        }

    # Build request payload
    def _create_request_payload(self, req: TTSProviderRequest):
        return {
            "text": req.input,
            "model_id": req.model,
            "voice_settings": {
                "speed": req.speed or 1.0
            }
        }

    # Create initial response object
    def _create_initial_response(self, req: TTSProviderRequest) -> TTSProviderResponse:
        return TTSProviderResponse(
            provider=req.provider,
            model=req.model,
            status="processing",
            output="",
            stream=req.stream,
            credentials_id=req.credentials_id,
            is_byok_enabled=req.is_byok_enabled,
            ref_id=req.ref_id,
            ref_type=req.ref_type,
            agent_name=req.agent_name,
            action=req.action,
            error=None
        )

    # Build final response and handle credit usage
    def _create_final_response(
        self,
        req: TTSProviderRequest,
        base_response: TTSProviderResponse,
        start_time: float,
        audio_base64: str,
        jwt: str
    ) -> TTSProviderResponse:

        end_time = time.perf_counter()

        # Fill response fields
        base_response.status = "completed"
        base_response.output = audio_base64
        base_response.time_taken = round(end_time - start_time, 2)
        base_response.token_count = len(req.input)

        # Post credit usage if not BYOK
        if not req.is_byok_enabled and not req.credentials_id:
            try:
                credit_manager = CreditManagerService()

                # Mapping of request model names to internal service type identifiers
                # This ensures consistent naming for billing/reporting
                TTS_MODEL_MAP = {
                    "eleven_v3": "ElevenLabsV3",
                    "eleven_multilingual_v2": "ElevenLabsMultilingualV2",
                    "eleven_multilingual_v3": "ElevenLabsMultilingualV3",
                    "eleven_turbo_v2": "ElevenLabsTurboV2",
                    "eleven_flash_v2": "ElevenLabsFlashV2",
                    "eleven_english_v2": "ElevenLabsEnglishV2",
                }

                # Resolve the internal service type based on requested model
                service_type = TTS_MODEL_MAP.get(req.model)
                
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
                }

                credit_manager.post_credit_usage(
                    task="elevenlabs_tts",
                    request=credit_usage,
                    jwt=jwt
                )

                logger.info(f"TTS credit usage posted | ref_id={req.ref_id}")

            except Exception as e:
                logger.error(f"Failed to post TTS credit usage | error={str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to post credit usage: {str(e)}"
                )

        return base_response