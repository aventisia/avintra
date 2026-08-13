import json
from typing import Any
from uuid import uuid4
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.core.config import settings
from app.core.database import get_db_session_context
from app.dependencies.authorize import authorize
from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMRequest
from app.features.langgraph.services.chat_service import chat_service
from app.features.llm_providers.llm_kb_retrieval import retrieve_and_inject_kb_context
from app.core.logger import logger


router = APIRouter()


# -----------------------------------------------------------
# Generate Chat Completion (LangGraph)
# -----------------------------------------------------------
# Endpoint Responsibilities:
#   • Normalize incoming request data.
#   • Resolve BYOK credentials.
#   • Retrieve and inject Knowledge Base context.
#   • Execute the LangGraph workflow.
#   • Support both streaming (SSE) and standard responses.
#   • Preserve conversation state using the provided conversation_id.
# -----------------------------------------------------------
@router.post("/chat/completions")
async def generate_langgraph_response_route(
    request: LLMRequest,
    user: User = Depends(authorize()),
):

    logger.info(
        "Received chat completion request. stream=%s conversation_id=%s model=%s temp=%s",
        request.stream,
        request.conversation_id,
        request.model,
        request.is_temp_chat,
    )

    try:

        # -------------------------------------------------------
        # Normalize Credential Identifier
        # -------------------------------------------------------
        # Convert empty values and the all-zero UUID into None so downstream services can consistently interpret the request as not using a BYOK credential.
        # -------------------------------------------------------
        credential_id = (
            str(request.credential_id).strip()
            if request.credential_id
            else None
        )

        if credential_id in {
            "",
            "00000000-0000-0000-0000-000000000000",
        }:
            request.credential_id = None
        else:
            request.credential_id = credential_id

        if request.conversation_id is None:
            request.conversation_id = str(uuid4())


        # -------------------------------------------------------
        # Inject Knowledge Base Context
        # -------------------------------------------------------
        # When one or more knowledge bases are configured, retrieve relevant context and enrich the user prompt before the LangGraph workflow begins.
        # -------------------------------------------------------
        if request.kb_names:
            await retrieve_and_inject_kb_context(
                request,
                user,
            )

        # -------------------------------------------------------
        # Streaming Response (Server-Sent Events)
        # -------------------------------------------------------
        # Stream LangGraph events to the client as they become available. Each event is serialized 
        # into JSON and sent using the Server-Sent Events (SSE) protocol.
        # -------------------------------------------------------
        if request.stream:
            async def event_generator():
                if request.is_temp_chat:
                    async for chunk in chat_service.stream(
                        request,
                        user,
                    ):
                        yield _serialize_chunk(chunk)
                else:
                    async with get_db_session_context(
                        settings.POSTGRESQL_WORKSPACE_DB_NAME,
                    ) as session:
                        async for chunk in chat_service.stream(
                            request,
                            user,
                            db_session=session,
                        ):
                            yield _serialize_chunk(chunk)
                            await session.commit()

            return StreamingResponse(
                event_generator(),
                media_type="text/event-stream",
            )

        # -------------------------------------------------------
        # Standard (Non-Streaming) Response
        # -------------------------------------------------------
        # Execute the LangGraph workflow synchronously and return
        # the completed response once generation finishes.
        # -------------------------------------------------------
        if request.is_temp_chat:
            response = await chat_service.invoke(
                request,
                user,
            )
        else:
            async with get_db_session_context(
                settings.POSTGRESQL_WORKSPACE_DB_NAME,
            ) as session:
                response = await chat_service.invoke(
                    request,
                    user,
                    db_session=session,
                )
                await session.commit()

        return response

    except HTTPException:
        logger.warning(
            "Request terminated with HTTPException."
        )
        raise

    except Exception:
        logger.exception(
            "Unexpected error occurred while generating LangGraph response."
        )

        raise HTTPException(
            status_code=400,
            detail="Failed to generate LangGraph response.",
        )


@router.post("/chat/completions/normalized")
async def generate_langgraph_response_normalized_route(
    request: LLMRequest,
    user: User = Depends(authorize()),
):
    """Stream a chat completion using the normalized, frontend-friendly protocol.

    Yields clean ``LLMChunkResponse``-shaped SSE frames (``delta``, ``tool_call``,
    ``tools``, ``followup``, ``done``) that the browser chat client can consume
    directly for token streaming, tool calling, and follow-up suggestions.

    Returns:
        A ``text/event-stream`` SSE response.
    """

    credential_id = str(request.credential_id).strip() if request.credential_id else None
    if credential_id in {"", "00000000-0000-0000-0000-000000000000"}:
        request.credential_id = None
    else:
        request.credential_id = credential_id

    if request.conversation_id is None:
        request.conversation_id = str(uuid4())

    if request.kb_names:
        await retrieve_and_inject_kb_context(request, user)

    async def event_generator():
        if request.is_temp_chat:
            async for chunk in chat_service.stream_normalized(request, user):
                yield _serialize_chunk(chunk)
        else:
            async with get_db_session_context(settings.POSTGRESQL_WORKSPACE_DB_NAME) as session:
                async for chunk in chat_service.stream_normalized(request, user, db_session=session):
                    yield _serialize_chunk(chunk)
                    await session.commit()

    return StreamingResponse(event_generator(), media_type="text/event-stream")


def _serialize_chunk(chunk: Any) -> str:
    """Serialize a stream chunk into a single SSE frame."""

    if isinstance(chunk, BaseModel):
        payload = chunk.model_dump_json()
    elif isinstance(chunk, dict):
        payload = json.dumps(
            chunk,
            default=str,
        )
    elif isinstance(chunk, str):
        payload = chunk
    else:
        payload = json.dumps(
            chunk,
            default=str,
        )

    return f"data: {payload}\n\n"
