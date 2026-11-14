"""Turn-timing benchmark: p50/p95 per stage for each engine configuration.

Run from ``apis/llmpipeline`` after at least one call per configuration, using
the conversation ids from ``run_Conversations`` (live calls persist timing):

    ./venv/Scripts/python.exe -m voice_agent.latency \
        batch=<conversationId,...> streaming=<conversationId,...> realtime=<conversationId,...>

Paste the printed table into ``app/features/voice_sessions/README.md``. Realtime
has no caller-speech-end reference, so its provider ``ttft_ms`` is reported as
both the first-token and the end-to-end value.
"""

from __future__ import annotations

import argparse
import asyncio
import math
from collections.abc import Iterable, Sequence
from typing import Any
from uuid import UUID

from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db_session_context
from app.features.langgraph.checkpoint.models import ConversationMessage

STAGES: tuple[tuple[str, str], ...] = (
    ("STT", "stt"),
    ("Endpointing", "endpointing"),
    ("First token", "first_token"),
    ("First audio", "first_audio"),
    ("End-to-end", "end_to_end"),
)


def _number(timing: dict[str, Any], key: str) -> float | None:
    value = timing.get(key)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return None
    return value if value >= 0 else None


def stage_values(timing: dict[str, Any]) -> dict[str, float | None]:
    """Map one persisted ``voice_turn_timing`` payload onto the reported stages."""

    first_token = _number(timing, "llm_first_token_ms")
    ttft = _number(timing, "ttft_ms")
    end_to_end = _number(timing, "caller_to_speaking_ms")

    return {
        "stt": _number(timing, "stt_ms"),
        "endpointing": _number(timing, "endpointing_ms"),
        "first_token": first_token if first_token is not None else ttft,
        "first_audio": _number(timing, "tts_first_audio_ms"),
        "end_to_end": end_to_end if end_to_end is not None else ttft,
    }


def percentile(values: Sequence[float], percent: int) -> int:
    """Nearest-rank percentile, so a small sample never interpolates."""

    ordered = sorted(values)
    rank = max(1, math.ceil(percent / 100 * len(ordered)))
    return round(ordered[rank - 1])


def summarize(config_timings: dict[str, Sequence[dict[str, Any]]]) -> str:
    """Render the Markdown benchmark table for one run per configuration."""

    header = "| Configuration | Turns | " + " | ".join(
        f"{label} p50 / p95 (ms)" for label, _ in STAGES
    ) + " |"
    separator = "| --- | --- |" + " --- |" * len(STAGES)
    lines = [header, separator]

    for name, timings in config_timings.items():
        stages = [stage_values(timing) for timing in timings]
        cells = [name, str(len(stages))]

        for _, key in STAGES:
            values = [stage[key] for stage in stages if stage[key] is not None]
            cells.append(
                f"{percentile(values, 50)} / {percentile(values, 95)}" if values else "-"
            )

        lines.append("| " + " | ".join(cells) + " |")

    return "\n".join(lines)


def _parse_conversation_ids(conversation_ids: Sequence[str]) -> list[UUID]:
    parsed: list[UUID] = []
    for conversation_id in conversation_ids:
        try:
            parsed.append(UUID(conversation_id))
        except ValueError as exc:
            raise SystemExit(
                f"Expected a conversation UUID, got '{conversation_id}'."
            ) from exc
    return parsed


async def load_timings(conversation_ids: Sequence[str]) -> list[dict[str, Any]]:
    """Read the persisted turn timing of the given conversations."""

    wanted = _parse_conversation_ids(conversation_ids)
    async with get_db_session_context(settings.POSTGRESQL_WORKSPACE_DB_NAME) as session:
        result = await session.execute(
            select(ConversationMessage.message_metadata).where(
                ConversationMessage.conversation_id.in_(wanted),
                ConversationMessage.message_metadata.is_not(None),
            )
        )
        metadata_rows = list(result.scalars())

    timings: list[dict[str, Any]] = []
    for metadata in metadata_rows:
        timing = (metadata or {}).get("voice_turn_timing")
        if isinstance(timing, dict):
            timings.append(timing)
    return timings


def parse_configs(pairs: Iterable[str]) -> dict[str, list[str]]:
    configs: dict[str, list[str]] = {}
    for pair in pairs:
        name, _, ids = pair.partition("=")
        conversation_ids = [value.strip() for value in ids.split(",") if value.strip()]
        if not name.strip() or not conversation_ids:
            raise SystemExit(f"Expected <name>=<conversationId,...>, got '{pair}'.")
        configs[name.strip()] = conversation_ids
    return configs


async def report(configs: dict[str, list[str]]) -> str:
    timings = {
        name: await load_timings(conversation_ids)
        for name, conversation_ids in configs.items()
    }
    return summarize(timings)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "configs",
        nargs="+",
        metavar="<name>=<conversationId,...>",
        help="One configuration per engine, for example batch=<id>,<id> realtime=<id>.",
    )
    print(asyncio.run(report(parse_configs(parser.parse_args().configs))))


if __name__ == "__main__":
    main()
