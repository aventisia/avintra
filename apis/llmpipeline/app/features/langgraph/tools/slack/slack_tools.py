from langchain_core.tools import tool

from app.features.langgraph.tools.slack.slack_client import list_channels, send_channel_message


@tool
def slack_send_message(
    channel: str,
    text: str,
) -> dict:
    """
    Send a message to a Slack channel.
    """

    return send_channel_message(
        channel=channel,
        text=text,
    )


@tool
def slack_list_channels() -> dict:
    """
    List accessible Slack channels.
    """

    return list_channels()
