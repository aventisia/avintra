"""Gmail API client placeholder."""

from app.core.logger import logger


async def send_email(
    to: str,
    subject: str,
    body: str,
) -> dict:
    """Send an email via Gmail. Placeholder implementation."""

    logger.debug(
        "Sending Gmail email to=%s subject=%s",
        to,
        subject,
    )

    return {
        "status": "sent",
        "to": to,
        "subject": subject,
    }


async def search_emails(
    query: str,
    max_results: int = 10,
) -> dict:
    """Search Gmail. Placeholder implementation."""

    logger.debug(
        "Searching Gmail. query=%s",
        query,
    )

    return {
        "query": query,
        "max_results": max_results,
        "results": [],
    }
