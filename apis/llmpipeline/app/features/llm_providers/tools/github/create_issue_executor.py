from app.core.logger import logger


class GithubCreateIssueExecutor:

    async def execute(
        self,
        arguments: dict,
        user
    ):

        try:

            owner = arguments.get("owner")
            repo = arguments.get("repo")
            title = arguments.get("title")
            body = arguments.get("body", "")
            labels = arguments.get("labels", [])
            assignees = arguments.get(
                "assignees",
                []
            )

            # Validate required fields
            missing_fields = []

            if not owner:
                missing_fields.append("owner")

            if not repo:
                missing_fields.append("repo")

            if not title:
                missing_fields.append("title")

            # Ask user for missing info
            if missing_fields:

                return {
                    "status": "requires_input",
                    "message": (
                        "Missing required GitHub "
                        "issue fields"
                    ),
                    "missing_fields": missing_fields,
                    "provided_fields": {
                        "owner": owner,
                        "repo": repo,
                        "title": title
                    }
                }

            # TODO:
            # Integrate GitHub API here

            logger.info(
                f"Creating GitHub issue "
                f"{owner}/{repo}"
            )

            # Example mock response
            github_issue = {
                "id": 101,
                "number": 12,
                "url": (
                    f"https://github.com/"
                    f"{owner}/{repo}/issues/12"
                )
            }

            return {
                "status": "success",
                "message": (
                    "GitHub issue created successfully"
                ),
                "data": {
                    "issue_id": github_issue["id"],
                    "issue_number": github_issue["number"],
                    "issue_url": github_issue["url"],
                    "owner": owner,
                    "repo": repo,
                    "title": title,
                    "labels": labels,
                    "assignees": assignees
                }
            }

        except Exception as e:

            logger.exception(
                "GitHub create issue tool failed"
            )

            return {
                "status": "failed",
                "message": (
                    "Failed to create GitHub issue"
                ),
                "error": str(e)
            }