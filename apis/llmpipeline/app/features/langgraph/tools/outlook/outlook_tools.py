"""Outlook tools exposed to LangGraph agents."""

from langchain_core.tools import tool


@tool
async def outlook_send_email(
    to: str,
    subject: str,
    body: str,
    from_address: str | None = None,
    cc: str | None = None,
    bcc: str | None = None,
) -> dict:
    """
    Send an email through the Microsoft 365 Outlook connector.

    Args:
        to: Recipient email address(es). Multiple addresses can be separated by semicolons.
        subject: Subject of the email.
        body: Plain text body of the email.
        from_address: Sender mailbox address. Required for application-only M365 authentication;
            if omitted, the authenticated user's email is used.
        cc: Optional CC recipients, semicolon-separated.
        bcc: Optional BCC recipients, semicolon-separated.

    Returns:
        Dict with status and response/error details.
    """

    # The real connector call is performed by the custom tool node which has
    # access to the request metadata (credential id, user access token). This
    # stub tool is registered so the planner and model know the schema.
    return {
        "status": "requires_backend_execution",
        "message": "Tool call will be executed by the backend connector.",
    }
