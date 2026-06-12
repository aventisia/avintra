CHAT_AGENT_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "text": {"type": "string"},
        "recommended_actions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "label": {"type": "string"},
                    "action": {"type": "string"},
                    "description": {"type": "string"}
                },
                "required": [
                    "label",
                    "action",
                    "description"
                ],
                "additionalProperties": False
            }
        }
    },
    "required": ["text", "recommended_actions"],
    "additionalProperties": False
}