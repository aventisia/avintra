from langgraph.checkpoint.memory import InMemorySaver


# Shared LangGraph memory store.
# Maintains conversation state using thread_id.
graph_memory = InMemorySaver()