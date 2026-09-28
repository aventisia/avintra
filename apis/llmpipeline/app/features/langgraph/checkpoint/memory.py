from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer


# Shared LangGraph memory store.
# Maintains conversation state using thread_id.
graph_memory = InMemorySaver(
    serde=JsonPlusSerializer(
        # Allow serializing request/skill/user objects stored in graph metadata
        # (needed for approval interrupts to survive checkpoint round-trips).
        # ``User`` excludes access_token/space_id from serialization; resume
        # re-seeds the live user before any credential-dependent execution.
        allowed_msgpack_modules=(
            ("app.features.langgraph.schemas.skill_schema", "SkillConfig"),
            ("app.features.llm_providers.llm_providers_schemas", "LLMRequest"),
            ("app.features.auth.authenticated_user", "User"),
        ),
    ),
)
