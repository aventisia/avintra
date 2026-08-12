# Shared helpers for turning exceptions into user-friendly messages.
from __future__ import annotations


def friendly_error(e: Exception) -> str:
    """Extract a concise, user-friendly message from an exception.

    Prefers a structured `message` when available (e.g. LiteLLM/OpenAI
    exceptions) and falls back to the exception's string form. Avoids leaking
    full stack traces / internal object dumps to the client.
    """
    message = getattr(e, "message", None) or str(e)
    message = str(message).strip()
    if not message:
        return "The provider returned an unknown error."
    return message[:2000]
