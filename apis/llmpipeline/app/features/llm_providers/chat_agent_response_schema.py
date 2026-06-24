CHAT_AGENT_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "text": {
            "type": "string",
            "description": (
                "Main response. Include all answers, questions, clarifications, requests for information, and follow-ups."
            )
        },
        "recommended_actions": {
            "type": "array",
            "description": (
                "Optional next steps the user can take independently. Never use for questions or requests to the user. If user input is needed, leave empty."
                "Do not use IDs, codes, snake_case, or internal action names."
            ),
            "items": {
                "type": "string",
                "description": (
                    "A concise actionable suggestion, not a question or request."
                )
            },
            "maxItems": 5
        }
    },
    "required": ["text", "recommended_actions"],
    "additionalProperties": False
}