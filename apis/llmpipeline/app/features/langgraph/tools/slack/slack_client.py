"""Slack API client placeholder."""

from app.core.logger import logger


async def send_channel_message(
    channel: str,
    text: str,
) -> dict:
    """Send a Slack channel message. Placeholder implementation."""

    logger.debug(
        "Sending Slack message to channel=%s",
        channel,
    )

    return {
        "channel": channel,
        "text": text,
        "status": "sent",
    }


async def list_channels() -> dict:
    """List accessible Slack channels. Placeholder implementation."""

    logger.debug("Listing Slack channels.")

    return {
        "channels": [],
    }
