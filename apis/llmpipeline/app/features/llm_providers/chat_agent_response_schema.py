CHAT_AGENT_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "text": {
            "type": "string",
            "description": "The primary response, explanation, or answer provided to the user."
        },
        "followup_messages": {
            "type": "array",
            "description": "An optional list of up to 5 short, actionable next steps or suggested follow-up queries.",
            "items": {
                "type": "string",
                "description": "A single, independent follow-up suggestion."
            },
            "maxItems": 5
        }
    },
    "required": ["text", "followup_messages"],
    "additionalProperties": False
}