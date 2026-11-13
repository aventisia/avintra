"""Request/response contracts for the voice catalog (TTS and realtime)."""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel

VoiceCapability = Literal["tts", "realtime"]


class VoiceInfo(BaseModel):
    """A provider voice with an optional preview URL."""

    id: str
    name: str
    sample: Optional[str] = None


class LanguageInfo(BaseModel):
    """A language supported by a provider voice model."""

    id: str
    name: str


class VoicesResponse(BaseModel):
    provider: str
    model: str
    capability: VoiceCapability
    voices: list[VoiceInfo]
    count: int


class LanguagesResponse(BaseModel):
    provider: str
    model: str
    capability: VoiceCapability
    languages: list[LanguageInfo]
    count: int
