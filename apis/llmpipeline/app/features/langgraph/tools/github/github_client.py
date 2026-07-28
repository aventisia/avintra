"""GitHub API client placeholder."""

from app.core.logger import logger


async def get_repository_issues(
    owner: str,
    repo: str,
    state: str = "open",
) -> dict:
    """List repository issues. Placeholder implementation."""

    logger.info(
        "Listing GitHub issues for %s/%s",
        owner,
        repo,
    )

    return {
        "owner": owner,
        "repo": repo,
        "state": state,
        "issues": [],
    }


async def create_issue(
    owner: str,
    repo: str,
    title: str,
    body: str,
) -> dict:
    """Create a GitHub issue. Placeholder implementation."""

    logger.info(
        "Creating GitHub issue %s/%s: %s",
        owner,
        repo,
        title,
    )

    return {
        "owner": owner,
        "repo": repo,
        "title": title,
        "status": "created",
    }
