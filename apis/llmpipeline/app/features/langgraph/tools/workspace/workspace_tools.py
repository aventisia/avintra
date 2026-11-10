from langchain_core.tools import tool


@tool
def workspace_navigate(route: str) -> str:
    """
    Show the user a button that opens a Workspace page. Pass one route exactly
    as listed under "Workspace pages" in the instructions; never invent one.
    """

    # The client renders the button and checks the route against the pages the
    # user can open, so the tool only acknowledges the call.
    return f"Showed the user a button that opens {route}."
