from langchain_core.tools import tool

from app.features.langgraph.tools.gmail.gmail_client import search_emails, send_email

@tool
def gmail_send_email(
    to: str,
    subject: str,
    body: str,
) -> dict:
    """
    Send an email through Gmail.
    """

    return send_email(
        to=to,
        subject=subject,
        body=body,
    )


@tool
def gmail_search_emails(
    query: str,
    max_results: int = 10,
) -> dict:
    """
    Search emails in Gmail.
    """

    return search_emails(
        query=query,
        max_results=max_results,
    )
