# In-memory streaming job tracking for the LLM Providers v2 feature.
#
# This mirrors the pattern of the legacy `llm_providers.llm_job_manager` but is
# self-contained here so it works with v2 DTOs and the LiteLLM service without
# coupling to the legacy `BaseLLMProvider` / `LLMRequest` types.
#
# A job is registered by its job_id together with an async generator function.
# The generator is produced by calling the stored callable; cancellation is
# signalled by removing the job_id from the active map (the generator checks it).
from __future__ import annotations

import uuid
from typing import AsyncGenerator, Callable

from .schemas import LLMGenerationChunk


class V2JobManager:
    """Tracks in-flight streaming generation jobs keyed by a job_id."""

    def __init__(self) -> None:
        # job_id -> callable that returns an async generator of JSON chunk strings
        self._active_jobs: dict[str, Callable[[], AsyncGenerator[str, None]]] = {}

    def register(self, factory: Callable[[], AsyncGenerator[str, None]]) -> str:
        job_id = str(uuid.uuid4())
        self._active_jobs[job_id] = factory
        return job_id

    def get_factory(self, job_id: str) -> Callable[[], AsyncGenerator[str, None]] | None:
        return self._active_jobs.get(job_id)

    def is_active(self, job_id: str) -> bool:
        return job_id in self._active_jobs

    def cancel(self, job_id: str) -> bool:
        return self._active_jobs.pop(job_id, None) is not None

    def active_job_ids(self) -> list[str]:
        return list(self._active_jobs.keys())

    def cleanup(self, job_id: str) -> None:
        self._active_jobs.pop(job_id, None)


v2_job_manager = V2JobManager()

