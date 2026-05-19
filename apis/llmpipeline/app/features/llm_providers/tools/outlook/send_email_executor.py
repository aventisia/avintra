from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMRequest
from app.core.logger import logger
from app.features.llm_providers.services.cloud_connector_executor import execute_agent


class OutlookSendEmailExecutor:
    """
    Executor class for sending emails via Outlook using a dynamic agent/cloud connector.
    """

    async def execute(
        self,
        arguments: dict,
        user: User,
        llm_request: LLMRequest
    ) -> dict:
        """
        Execute sending an email via Outlook using dynamic agent execution.

        Parameters:
        - arguments: dict containing email fields:
            - To, From, Subject, Content
            - optional: CC, BCC, ContentType,
                        Importance, Sensitivity, SaveToSentItems
        - user: Authenticated user object
        - llm_request: LLMRequest object containing agent/context info and tools

        Returns:
        - dict with status, message, and optionally data or error
        """
        try:
            # Validate required fields
            required_fields = ["to", "from", "subject", "content"]

            missing_fields = [
                field for field in required_fields
                if not arguments.get(field)
            ]

            if missing_fields:
                logger.warning(
                    f"Outlook email missing required fields: {missing_fields}"
                )

                return {
                    "status": "requires_input",
                    "message": "Missing required email fields",
                    "missing_fields": missing_fields,
                    "provided_fields": {
                        k: arguments.get(k)
                        for k in ["to", "from", "subject"]
                    }
                }

            # Set default values
            arguments.setdefault("cc", "")
            arguments.setdefault("bcc", "")
            arguments.setdefault("contentType", "Text")
            arguments.setdefault("importance", "Normal")
            arguments.setdefault("sensitivity", "Normal")
            arguments.setdefault("saveToSentItems", False)

            # Find Outlook credentialId dynamically from llm_request.tool_config
            credential_id = None

            for tool in getattr(llm_request, "tool_config", []):
                platform = getattr(tool, "platform", "")

                if platform.lower() == "outlook":
                    credential_id = getattr(tool, "credential_id", None)
                    break

            if not credential_id:
                logger.error("Outlook credential not found in LLM tool_config")

                return {
                    "status": "failed",
                    "message": "No Outlook credential found in LLM tool_config"
                }

            # Set the cloud connector endpoint for M365 Outlook
            endpoint = "cloud-connector/m365/outlook/invoke"

            # # Build agent data for execution
            # agent_data = {
            #     "agentId": llm_request.ref_id,
            #     "agentName": llm_request.ref_name,
            #     "provider": "Outlook",
            #     "action": "SendEmailThroughOutlook",
            #     "credentialId": credential_id,
            #     "payload": arguments,
            # }

            # # Call the cloud connector / agent execution
            # agent_response = await execute_agent(
            #     user=user,
            #     agent_data=agent_data,
            #     endpoint=endpoint,
            #     method="Post"
            # )

            return {
                "agentId": llm_request.ref_id,
                "agentName": llm_request.ref_name,
                "provider": "Outlook",
                "action": "SendEmailThroughOutlook",
                "credentialId": credential_id,
                "payload": arguments,
            }

        except Exception as e:
            # Catch unexpected exceptions and log full stack trace
            logger.exception(
                f"Outlook send email tool failed for user "
                f"'{getattr(user, 'id', 'anonymous')}'"
            )

            return {
                "status": "failed",
                "message": "Failed to send email via Outlook",
                "error": str(e)
            }