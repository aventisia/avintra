import pytest
from langchain_anthropic.chat_models import _format_messages
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

from app.features.langgraph.nodes.model_node import _apply_short_term_window, _with_text_blocks


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


def test_streamed_thinking_reply_keeps_text_as_blocks_without_empty_parts():
    thinking = {"type": "thinking", "thinking": "plan", "signature": "sig", "index": 0}
    streamed = AIMessage(content=["", thinking, "I've added sunscreen."])

    reply = _with_text_blocks(streamed)

    assert reply.content == [thinking, {"type": "text", "text": "I've added sunscreen."}]
    _, formatted = _format_messages(
        [HumanMessage(content="add sunscreen"), reply, HumanMessage(content="thanks")],
        model="claude-sonnet-4-5",
    )
    assert all(
        block.get("text") != ""
        for message in formatted
        if isinstance(message["content"], list)
        for block in message["content"]
    )


@pytest.mark.parametrize(
    "content",
    [
        [{"type": "text", "text": ""}, {"type": "thinking", "thinking": "plan", "signature": "sig"}],
        ["  \n", {"type": "thinking", "thinking": "plan", "signature": "sig"}],
        [{"type": "text", "text": " "}, {"type": "thinking", "thinking": "plan", "signature": "sig"}],
    ],
)
def test_blank_text_blocks_are_dropped(content):
    reply = _with_text_blocks(AIMessage(content=content))

    assert reply.content == [{"type": "thinking", "thinking": "plan", "signature": "sig"}]


def test_reply_with_only_blank_text_formats_for_anthropic():
    reply = _with_text_blocks(AIMessage(content=["", {"type": "text", "text": " "}]))

    assert reply.content == []
    _format_messages(
        [HumanMessage(content="hi"), reply, HumanMessage(content="again")],
        model="claude-sonnet-4-5",
    )


def test_clean_reply_is_returned_unchanged():
    streamed = AIMessage(content=[{"type": "text", "text": "Done."}])

    assert _with_text_blocks(streamed) is streamed
