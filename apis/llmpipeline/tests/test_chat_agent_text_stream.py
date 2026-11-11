"""Chat-agent replies stream the JSON ``text`` field live, whatever the token split.

Run from ``apis/llmpipeline``:

    ./venv/bin/python -m pytest tests/test_chat_agent_text_stream.py -q
"""

import json

import pytest

from app.features.langgraph.services.chat_agent_text_stream import ChatAgentTextStream


def _stream(raw: str, size: int) -> tuple[str, list[str]]:
    stream = ChatAgentTextStream()
    pieces = [stream.feed(raw[i : i + size]) for i in range(0, len(raw), size)]
    return stream.text, pieces


TEXT = 'Line "one"\n\ttab \\ slash / café \U0001f600 done'


@pytest.mark.parametrize("size", [1, 2, 3, 5, 7, 1000])
def test_streams_the_text_field_of_a_json_reply(size):
    raw = '{"tool_names": ["text"]}' + json.dumps(
        {"text": TEXT, "followup_messages": ['say "text": "no"']}
    )
    text, pieces = _stream(raw, size)
    assert text == TEXT
    if size == 1:
        assert sum(1 for p in pieces if p) > 10


def test_streams_plain_replies_as_they_are():
    text, pieces = _stream("  Hello there, {not json}", 4)
    assert text == "  Hello there, {not json}"
    assert pieces[0] == "  He"


def test_reads_a_fenced_json_reply():
    raw = '```json\n{"text": "fenced"}\n```'
    assert _stream(raw, 3)[0] == "fenced"
