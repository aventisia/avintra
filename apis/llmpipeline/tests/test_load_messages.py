import asyncio
import uuid
from types import SimpleNamespace

from langchain_core.messages import AIMessage

from app.features.langgraph.checkpoint.persistence import load_messages


class _Session:
    def __init__(self, records):
        self._records = records

    async def execute(self, _statement):
        return SimpleNamespace(scalars=lambda: SimpleNamespace(all=lambda: self._records))


def test_assistant_row_with_null_tool_calls_loads():
    record = SimpleNamespace(
        id=uuid.uuid4(),
        role="assistant",
        content="Mango",
        message_metadata={"message_id": "a1", "tool_calls": None},
    )
    messages = asyncio.run(load_messages(_Session([record]), str(uuid.uuid4())))
    assert isinstance(messages[0], AIMessage) and messages[0].tool_calls == []
