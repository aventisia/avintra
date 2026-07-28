from langchain_core.tools import tool

from app.features.langgraph.tools.calendar.calendar_client import create_event, list_upcoming_events


@tool
def calendar_create_event(
    title: str,
    start_time: str,
    end_time: str,
) -> dict:
    """
    Create a calendar event.
    """

    return create_event(
        title=title,
        start_time=start_time,
        end_time=end_time,
    )


@tool
def calendar_list_events(
    max_results: int = 10,
) -> dict:
    """
    List upcoming calendar events.
    """

    return list_upcoming_events(
        max_results=max_results,
    )
