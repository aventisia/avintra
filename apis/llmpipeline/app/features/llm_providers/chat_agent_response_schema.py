CHAT_AGENT_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "text": {
            "type": "string"
        },
        "recommended_actions": {
            "type": "array",
            "description": "List of user-facing action suggestions written as complete natural-language phrases. Do not use IDs, codes, snake_case, or internal action names.",
            "items": {
                "type": "string"
            },
            "maxItems": 5
        }
    },
    "required": ["text", "recommended_actions"],
    "additionalProperties": False
}