from app.core.logger import logger


class GmailSendEmailExecutor:

    async def execute(
        self,
        arguments: dict,
        user
    ):

        try:

            to = arguments.get("to")
            cc = arguments.get("cc", [])
            bcc = arguments.get("bcc", [])
            subject = arguments.get("subject")
            body = arguments.get("body")
            is_html = arguments.get(
                "is_html",
                False
            )

            # Validate required fields
            missing_fields = []

            if not to:
                missing_fields.append("to")

            if not subject:
                missing_fields.append("subject")

            if not body:
                missing_fields.append("body")

            # Ask user for missing input
            if missing_fields:

                return {
                    "status": "requires_input",
                    "message": (
                        "Missing required email fields"
                    ),
                    "missing_fields": missing_fields,
                    "provided_fields": {
                        "to": to,
                        "subject": subject
                    }
                }

            # TODO:
            # Integrate Gmail API here

            logger.info(
                f"Sending email to: {to}"
            )

            # Example simulated response
            gmail_response = {
                "message_id": "gmail-msg-123"
            }

            return {
                "status": "success",
                "message": (
                    f"Email sent successfully to {to}"
                ),
                "data": {
                    "to": to,
                    "cc": cc,
                    "bcc": bcc,
                    "subject": subject,
                    "is_html": is_html,
                    "gmail_message_id": gmail_response.get(
                        "message_id"
                    )
                }
            }

        except Exception as e:

            logger.exception(
                "Gmail send email tool failed"
            )

            return {
                "status": "failed",
                "message": (
                    "Failed to send email"
                ),
                "error": str(e)
            }