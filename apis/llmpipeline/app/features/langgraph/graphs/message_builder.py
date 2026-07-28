from typing import Any

from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
)

from app.core.logger import logger
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def build_messages(llm_request: LLMRequest) -> list[Any]:
    """
    Convert request input into LangChain messages.
    Attach files to the latest user message.
    """

    messages = []

    # Handle simple text input
    if isinstance(llm_request.input, str):
        messages.append(
            HumanMessage(content=llm_request.input)
        )

    # Handle chat history input
    elif isinstance(llm_request.input, list):
        for message in llm_request.input:
            role = getattr(message, "role", None)
            content = getattr(message, "content", "")

            if role == "system":
                messages.append(
                    SystemMessage(content=content)
                )

            elif role == "user":
                messages.append(
                    HumanMessage(content=content)
                )

            elif role in ("assistant", "model"):
                messages.append(
                    AIMessage(content=content)
                )

    # Add files to the last user message
    last_human_message = next(
        (
            message
            for message in reversed(messages)
            if isinstance(message, HumanMessage)
        ),
        None,
    )

    if llm_request.files:
        if last_human_message:
            attach_files_to_human_message(
                last_human_message,
                llm_request.files,
            )
        else:
            messages.append(
                attach_files_to_human_message(
                    None,
                    llm_request.files,
                )
            )

    return messages


def attach_files_to_human_message(
    message: HumanMessage | None,
    files: list[str] | str,
) -> HumanMessage:
    """
    Add image/PDF attachments to a human message.
    """

    if isinstance(files, str):
        files = [files]

    # Create empty user message for file-only requests
    if message is None:
        message = HumanMessage(content=[])

    # Convert text content into multimodal format
    if isinstance(message.content, str):
        content = [
            {
                "type": "text",
                "text": message.content,
            }
        ]
    else:
        content = list(message.content)

    # Add supported attachments
    for file in files:
        if file.startswith("http") or file.startswith("data:image/"):
            content.append(
                {
                    "type": "image_url",
                    "image_url": {
                        "url": file,
                    },
                }
            )

        elif (
            file.lower().endswith(".pdf")
            or file.startswith("data:application/pdf")
        ):
            content.append(
                {
                    "type": "file",
                    "file": {
                        "url": file,
                    },
                }
            )

        else:
            logger.info(
                "Unsupported attachment type: %s",
                file,
            )

    message.content = content

    return message