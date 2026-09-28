from langgraph.checkpoint.memory import InMemorySaver
from langgraph.checkpoint.serde.jsonplus import JsonPlusSerializer


# Shared LangGraph memory store.
# Maintains conversation state using thread_id.
#
# IMPORTANT NOTE: This checkpointer (and the compiled-graph cache in
# ChatService) is process-local. Tool-approval pauses therefore die on
# process restart (every deploy), and resume requests must reach the same
# process that holds the pause. Keep uvicorn at a single worker per instance;
# `--workers > 1` or multiple replicas route a resume to a process without
# the pause, which fails closed as a 409 "approval expired" the client
# renders as a retry prompt. The history sanitizer in ChatService keeps
# later turns working after such a loss.
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
