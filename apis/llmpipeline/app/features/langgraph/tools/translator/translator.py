from langchain_core.tools import tool


@tool
def translate_text(
    text: str,
    language: str,
) -> str:
    """
    Translate text.

    Placeholder tool.
    Replace with translation provider later.
    """

    return (
        f"[Translated to {language}] "
        f"{text}"
    )