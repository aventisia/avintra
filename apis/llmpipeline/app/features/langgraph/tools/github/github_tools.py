"""GitHub tools exposed to LangGraph agents."""

from langchain_core.tools import tool

from app.features.langgraph.tools.github.github_client import (
    create_issue,
    get_repository_issues,
)


@tool
def github_list_issues(
    owner: str,
    repo: str,
    state: str = "open",
) -> dict:
    """
    List issues in a GitHub repository.
    """

    return get_repository_issues(
        owner=owner,
        repo=repo,
        state=state,
    )


@tool
def github_create_issue(
    owner: str,
    repo: str,
    title: str,
    body: str,
) -> dict:
    """
    Create an issue in a GitHub repository.
    """

    return create_issue(
        owner=owner,
        repo=repo,
        title=title,
        body=body,
    )
