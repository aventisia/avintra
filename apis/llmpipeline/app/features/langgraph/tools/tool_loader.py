from app.features.langgraph.tools.translator.translator import translate_text
from app.features.langgraph.tools.gmail.gmail_tools import gmail_search_emails, gmail_send_email
from app.features.langgraph.tools.github.github_tools import github_create_issue, github_list_issues
from app.features.langgraph.tools.slack.slack_tools import slack_list_channels, slack_send_message
from app.features.langgraph.tools.calendar.calendar_tools import calendar_create_event, calendar_list_events
from app.features.langgraph.tools.outlook.outlook_tools import outlook_send_email


def load_platform_tools(
    registry,
):
    """
    Register built-in and integration LangGraph tools.

    This method is executed during application startup to populate the
    ToolRegistry with platform tools and optional third-party
    integrations.

    Registered tools:
        - calculator, current_time, summarize_text, translate_text,
          analyze_text: Built-in utility tools.

        - gmail_send_email, gmail_search_emails: Gmail integration.

        - github_list_issues, github_create_issue: GitHub integration.

        - slack_send_message, slack_list_channels: Slack integration.

        - calendar_create_event, calendar_list_events: Calendar integration.

    Args:
        registry:
            ToolRegistry instance responsible for storing and retrieving
            available tools.

    Returns:
        None
    """

    registry.register_many(
        [
            translate_text,
            gmail_send_email,
            gmail_search_emails,
            github_list_issues,
            github_create_issue,
            slack_send_message,
            slack_list_channels,
            calendar_create_event,
            calendar_list_events,
            outlook_send_email,
        ]
    )