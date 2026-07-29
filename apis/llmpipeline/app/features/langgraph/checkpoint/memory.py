from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer


# Shared LangGraph memory store.
# Maintains conversation state using thread_id.
graph_memory = InMemorySaver(
    serde=JsonPlusSerializer(
        # Allow serializing SkillConfig objects stored in graph metadata.
        allowed_msgpack_modules=(
            ("app.features.langgraph.schemas.skill_schema", "SkillConfig"),
        ),
    ),
)
