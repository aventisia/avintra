# Aggregate router for the LiteLLM feature.
#
# Exposes a single `router` that mounts every capability sub-router plus the
# shared `core` admin routes. `main.py` imports only this router. New
# capabilities add their sub-router here.
from __future__ import annotations

from fastapi import APIRouter

from .core.routes import router as core_router
from .embeddings.routes import router as embeddings_router
from .stt.routes import router as stt_router
from .text_generation.routes import router as text_generation_router
from .tts.routes import router as tts_router
from .voice_catalog.routes import router as voice_catalog_router

router = APIRouter()

router.include_router(core_router)
router.include_router(text_generation_router)
router.include_router(embeddings_router)
router.include_router(stt_router)
router.include_router(tts_router)
router.include_router(voice_catalog_router)
