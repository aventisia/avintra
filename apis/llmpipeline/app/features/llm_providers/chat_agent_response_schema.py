CHAT_AGENT_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "text": {
            "type": "string"
        },
        "recommended_actions": {
            "type": "array",
            "description": "List of up to 5 user-friendly suggested next actions. Use natural language text, not internal action IDs or snake_case values.",
            "items": {
                "type": "string"
            },
            "maxItems": 5
        }
    },
    "required": ["text", "recommended_actions"],
    "additionalProperties": False
}