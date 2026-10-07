"""Regression tests for planner tool/skill selection parsing.

The planner prompt embeds the response schema, so weaker models echo its
top-level ``"type": "object"`` key (or add other keys). The parser must read
only ``tool_names`` / ``skill_names`` instead of splatting the whole object
into ``ToolSkillSelectionResponse``, which fails with::

    TypeError: ToolSkillSelectionResponse.__init__() got an unexpected
    keyword argument 'type'

Run from ``apis/llmpipeline`` (``ENV`` defaults to ``local``):

    ./venv/bin/python -m pytest tests/test_tool_skill_selection_parse.py -q
"""

import pytest

from app.features.langgraph.services.tool_skill_selector import (
    _parse_selection_output,
)


def test_parses_plain_selection():
    parsed = _parse_selection_output(
        '{"tool_names": ["outlook_send_email"], "skill_names": ["emailwriter2"]}'
    )
    assert parsed.tool_names == ["outlook_send_email"]
    assert parsed.skill_names == ["emailwriter2"]


def test_ignores_echoed_schema_type_key():
    parsed = _parse_selection_output(
        '{"type": "object", "tool_names": ["outlook_send_email"], "skill_names": []}'
    )
    assert parsed.tool_names == ["outlook_send_email"]
    assert parsed.skill_names == []


def test_ignores_other_extra_keys():
    parsed = _parse_selection_output(
        '{"type": "object", "description": "x", "tool_names": [], "skill_names": ["a"]}'
    )
    assert parsed.tool_names == []
    assert parsed.skill_names == ["a"]


def test_parses_fenced_json_with_extra_key():
    parsed = _parse_selection_output(
        '```json\n{"type": "object", "tool_names": ["t"], "skill_names": []}\n```'
    )
    assert parsed.tool_names == ["t"]


def test_coerces_bare_string_and_null_names():
    parsed = _parse_selection_output(
        '{"tool_names": "outlook_send_email", "skill_names": null}'
    )
    assert parsed.tool_names == ["outlook_send_email"]
    assert parsed.skill_names == []


def test_missing_selection_fields_raise():
    with pytest.raises(ValueError):
        _parse_selection_output('{"type": "object"}')


def test_non_object_raises():
    with pytest.raises(ValueError):
        _parse_selection_output('["outlook_send_email"]')
