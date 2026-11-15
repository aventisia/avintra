"""Turn-timing benchmark aggregation tests for #373 (Phase 5, slice 6).

Run from ``apis/llmpipeline``:

    python -m pytest tests/test_voice_latency.py -q
"""

from __future__ import annotations

import asyncio

import pytest

from voice_agent.latency import (
    load_timings,
    parse_configs,
    percentile,
    stage_values,
    summarize,
)

PIPELINE_TIMING = {
    "stt_ms": 300,
    "llm_first_token_ms": 500,
    "tts_first_audio_ms": 800,
    "turn_total_ms": 1200,
    "endpointing_ms": 250,
    "caller_to_speaking_ms": 1350,
    "ttft_ms": None,
    "duration_ms": None,
}

REALTIME_TIMING = {
    "stt_ms": None,
    "llm_first_token_ms": None,
    "tts_first_audio_ms": None,
    "turn_total_ms": None,
    "endpointing_ms": None,
    "caller_to_speaking_ms": None,
    "ttft_ms": 420,
    "duration_ms": 2100,
}


def test_percentile_uses_nearest_rank() -> None:
    values = list(range(1, 11))

    assert percentile(values, 50) == 5
    assert percentile(values, 95) == 10
    assert percentile([7], 95) == 7


def test_pipeline_stages_report_speech_end_relative_values() -> None:
    assert stage_values(PIPELINE_TIMING) == {
        "stt": 300,
        "endpointing": 250,
        "first_token": 500,
        "first_audio": 800,
        "end_to_end": 1350,
    }


def test_realtime_falls_back_to_ttft_for_first_token_and_end_to_end() -> None:
    assert stage_values(REALTIME_TIMING) == {
        "stt": None,
        "endpointing": None,
        "first_token": 420,
        "first_audio": None,
        "end_to_end": 420,
    }


def test_summarize_renders_p50_p95_and_skips_missing_stages() -> None:
    table = summarize(
        {
            "batch": [PIPELINE_TIMING, dict(PIPELINE_TIMING, stt_ms=100)],
            "realtime": [REALTIME_TIMING],
        }
    )
    rows = table.splitlines()

    assert rows[0].startswith("| Configuration | Turns | STT p50 / p95 (ms)")
    assert "| batch | 2 | 100 / 300 | 250 / 250 | 500 / 500 | 800 / 800 | 1350 / 1350 |" in rows
    assert "| realtime | 1 | - | - | 420 / 420 | - | 420 / 420 |" in rows


def test_parse_configs_reads_one_conversation_list_per_engine() -> None:
    configs = parse_configs(["batch=a,b", "realtime=c"])

    assert configs == {"batch": ["a", "b"], "realtime": ["c"]}


def test_load_timings_rejects_a_non_uuid_before_querying() -> None:
    with pytest.raises(SystemExit, match="conversation UUID"):
        asyncio.run(load_timings(["not-a-uuid"]))
