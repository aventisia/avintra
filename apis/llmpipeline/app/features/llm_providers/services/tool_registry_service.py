from app.features.llm_providers.tools.outlook.send_email_executor import OutlookSendEmailExecutor
from app.features.llm_providers.tools.sendgrid.send_email_executor import SendGridSendEmailExecutor
from app.features.llm_providers.tools.github.create_issue_executor import GithubCreateIssueExecutor
from app.features.llm_providers.tools.gmail.get_emails_executor import GmailGetEmailsExecutor
from app.features.llm_providers.tools.gmail.send_email_executor import GmailSendEmailExecutor


class ToolRegistryService:

    REGISTRY = {
        "gmail_send_email": GmailSendEmailExecutor(),
        "gmail_get_emails": GmailGetEmailsExecutor(),
        "github_create_issue": GithubCreateIssueExecutor(),
        "github_create_issue": GithubCreateIssueExecutor(),
        "outlook_send_email": OutlookSendEmailExecutor(),
        "sendgrid_send_email": SendGridSendEmailExecutor(),
    }

    @classmethod
    def get_tool(cls, tool_name):
        return cls.REGISTRY.get(tool_name)