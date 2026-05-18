from app.core.logger import logger


class GmailGetEmailsExecutor:

    async def execute(
        self,
        arguments: dict,
        user
    ):

        try:

            query = arguments.get("query", "")
            max_results = arguments.get(
                "max_results",
                10
            )
            include_body = arguments.get(
                "include_body",
                False
            )
            label = arguments.get("label")

            # Validate max_results
            if max_results <= 0:

                return {
                    "status": "failed",
                    "message": (
                        "max_results must be greater than 0"
                    )
                }

            # Optional clarification
            # Example:
            # If no query and no label,
            # ask user what emails they want

            if not query and not label:

                return {
                    "status": "requires_input",
                    "message": (
                        "Please specify what emails "
                        "you want to retrieve"
                    ),
                    "missing_fields": [
                        "query_or_label"
                    ]
                }

            # TODO:
            # Integrate Gmail API here

            logger.info(
                f"Fetching Gmail emails "
                f"query={query} "
                f"label={label}"
            )

            # Example mock emails
            emails = [
                {
                    "id": "email_001",
                    "from": "john@example.com",
                    "subject": "Hello",
                    "snippet": "Test email",
                    "body": (
                        "This is test email body"
                        if include_body
                        else None
                    )
                }
            ]

            return {
                "status": "success",
                "message": (
                    f"Retrieved {len(emails)} emails"
                ),
                "count": len(emails),
                "data": {
                    "emails": emails,
                    "query": query,
                    "label": label,
                    "max_results": max_results
                }
            }

        except Exception as e:

            logger.exception(
                "Gmail get emails tool failed"
            )

            return {
                "status": "failed",
                "message": (
                    "Failed to retrieve emails"
                ),
                "error": str(e)
            }