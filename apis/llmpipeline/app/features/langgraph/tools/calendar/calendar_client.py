"""Calendar API client placeholder."""

from datetime import datetime, timezone

from app.core.logger import logger


async def create_event(
    title: str,
    start_time: str,
    end_time: str,
) -> dict:
    """Create a calendar event. Placeholder implementation."""

    logger.info(
        "Creating calendar event: %s",
        title,
    )

    return {
        "title": title,
        "start_time": start_time,
        "end_time": end_time,
        "status": "created",
    }


async def list_upcoming_events(
    max_results: int = 10,
) -> dict:
    """List upcoming calendar events. Placeholder implementation."""

    logger.info("Listing upcoming calendar events.")

    return {
        "now": datetime.now(timezone.utc).isoformat(),
        "max_results": max_results,
        "events": [],
    }
