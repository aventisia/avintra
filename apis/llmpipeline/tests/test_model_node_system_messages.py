import pytest
from langchain_anthropic.chat_models import _format_messages
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.features.langgraph.nodes.model_node import _apply_short_term_window


def _second_turn_state(second_system: str = "sys"):
    return [
        SystemMessage(content="sys"),
        HumanMessage(content="hi"),
        AIMessage(content="hello"),
        SystemMessage(content=second_system),
        HumanMessage(content="again"),
    ]


@pytest.mark.parametrize("max_short_term_turns", [None, 0, 5])
def test_resent_system_prompt_is_kept_once_and_leads(max_short_term_turns):
    messages = _apply_short_term_window(_second_turn_state(), max_short_term_turns)

    assert [type(m) for m in messages] == [SystemMessage, HumanMessage, AIMessage, HumanMessage]


@pytest.mark.parametrize("max_short_term_turns", [None, 0])
def test_distinct_system_prompts_lead_the_conversation(max_short_term_turns):
    messages = _apply_short_term_window(_second_turn_state("edited"), max_short_term_turns)

    assert [m.content for m in messages[:2]] == ["sys", "edited"]
    assert not any(isinstance(m, SystemMessage) for m in messages[2:])


@pytest.mark.parametrize("max_short_term_turns", [None, 0])
def test_second_turn_formats_for_anthropic(max_short_term_turns):
    messages = _apply_short_term_window(_second_turn_state(), max_short_term_turns)

    _format_messages(messages, model="claude-sonnet-4-5")
