from app.features.auth.authenticated_user import User
from app.features.llm_providers.llm_providers_schemas import LLMRequest
from app.core.logger import logger
from app.features.llm_providers.services.cloud_connector_executor import execute_agent


class SendGridSendEmailExecutor:
    """
    Executor class for sending emails via SendGrid using a dynamic agent/cloud connector.
    """

    async def execute(
        self,
        arguments: dict,
        user: User,
        llm_request: LLMRequest
    ) -> dict:
        """
        Execute sending an email via SendGrid using dynamic agent execution.

        Parameters:
        - arguments: dict containing email fields:
            - to, from_email, from_name, subject, body
            - optional: cc, bcc, is_html
        - user: Authenticated user object (used for authorization)
        - llm_request: LLMRequest object containing agent/context info and tools

        Returns:
        - dict with status, message, and optionally data or error
        """
        try:
            # Extract email fields from arguments
            # to = arguments.get("to")
            # from_email = arguments.get("from_email")
            # from_name = arguments.get("from_name")
            # subject = arguments.get("subject")
            # body = arguments.get("body")
            # cc = arguments.get("cc", [])
            # bcc = arguments.get("bcc", [])
            # is_html = arguments.get("is_html", False)

            # Validate required fields
            missing_fields = [f for f in ["to", "from_email", "from_name", "subject", "body"] if not arguments.get(f)]
            if missing_fields:
                logger.warning(f"SendGrid email missing required fields: {missing_fields}")
                return {
                    "status": "requires_input",
                    "message": "Missing required email fields",
                    "missing_fields": missing_fields,
                    "provided_fields": {k: arguments.get(k) for k in ["to", "subject", "from_email", "from_name"]}
                }

            # Find SendGrid credentialId dynamically from llm_request.tools
            credential_id = None
            for tool in getattr(llm_request, "tools", []):
                if tool.get("platform", "").lower() == "sendgrid":
                    credential_id = tool.get("credential_id")
                    break

            if not credential_id:
                logger.error("SendGrid credential not found in LLM tools")
                return {
                    "status": "failed",
                    "message": "No SendGrid credential found in LLM tools"
                }

            # Set the cloud connector endpoint for SendGrid
            endpoint = "cloud-connector/sendgrid/invoke"

            # Build agent data for execution
            # agent_data = {
            #     "agentId": llm_request.agentId,
            #     "agentName": llm_request.agentName,
            #     "provider": "SendGrid",
            #     "action": "SendEmailThroughSendGrid",
            #     "credentialId": credential_id,
            #     "payload": arguments,
            # }

            # # Call the cloud connector / agent execution
            # agent_response = await execute_agent(
            #     user=user,
            #     agent_data=agent_data,
            #     endpoint=endpoint,
            #     method="Post")

            return {
                "agentId": llm_request.agentId,
                "agentName": llm_request.agentName,
                "provider": "SendGrid",
                "action": "SendEmailThroughSendGrid",
                "credentialId": credential_id,
                "payload": arguments,
            }


        except Exception as e:
            # Catch unexpected exceptions and log full stack trace
            logger.exception(f"SendGrid send email tool failed for user '{getattr(user, 'id', 'anonymous')}'")
            return {
                "status": "failed",
                "message": "Failed to send email via SendGrid",
                "error": str(e)
            }