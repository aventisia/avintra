"""Outlook (Microsoft 365) cloud connector client for LangGraph."""

from typing import Any

from app.core.logger import logger
from app.features.llm_providers.services.cloud_connector_executor import execute_agent


async def send_email_via_outlook(
    user: Any,
    credential_name: str,
    to: str,
    subject: str,
    body: str,
    from_address: str | None = None,
    cc: str | None = None,
    bcc: str | None = None,
    agent_id: str | None = None,
    agent_name: str | None = None,
) -> dict:
    """
    Send an email via the WorkspaceAPIs M365 Outlook cloud connector.

    Args:
        user: Authenticated user with ``access_token``.
        credential_name: Outlook credential name configured in Studio.
        to: Semicolon-separated recipient email addresses.
        subject: Email subject.
        body: Email body content.
        from_address: Optional sender mailbox address.
        cc: Optional semicolon-separated CC addresses.
        bcc: Optional semicolon-separated BCC addresses.
        agent_id: Optional agent reference id for connector logging.
        agent_name: Optional agent reference name for connector logging.

    Returns:
        Dict with ``status`` and either ``response`` or ``error``.
    """

    if not from_address:
        return {
            "status": "failed",
            "error": "Sender mailbox (from_address) is required for Outlook application-only authentication.",
        }

    payload: dict[str, Any] = {
        "to": to,
        "subject": subject,
        "content": body,
        "contentType": "Text",
        "importance": "Normal",
        "sensitivity": "Normal",
        "saveToSentItems": True,
        "from": from_address,
        "mailboxAddress": from_address,
    }

    if cc:
        payload["cc"] = cc

    if bcc:
        payload["bcc"] = bcc

    agent_data = {
        "agentId": agent_id or "00000000-0000-0000-0000-000000000000",
        "agentName": agent_name or "HR_Advisor",
        "provider": "M365/Outlook",
        "action": "SendEmail",
        "credentialName": credential_name,
        "payload": payload,
    }

    logger.debug(
        "Sending Outlook email. credential_name=%s to=%s subject=%s agent=%s",
        credential_name,
        to,
        subject,
        agent_name,
    )

    result = await execute_agent(
        user=user,
        agent_data=agent_data,
        endpoint="cloud-connector/m365/outlook/invoke",
        method="POST",
    )

    logger.debug(
        "Outlook email result: %s",
        result,
    )

    return result
