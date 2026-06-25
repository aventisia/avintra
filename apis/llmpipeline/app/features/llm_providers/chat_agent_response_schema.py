CHAT_AGENT_RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "text": {
            "type": "string",
            "description": "Main response. Put all text, explanations, and questions for the user here."
        },
        "recommended_actions": {
            "type": "array",
            "description": (
                "Independent next steps the user can take WITHOUT replying to the AI (e.g., 'View dashboard'). "
                "Forbidden: No questions, no conversational replies, and no prompt shortcuts (e.g., do NOT include 'Ask about pricing'). "
                "Leave empty [] if the user needs to reply or provide information next."
            ),
            "items": {
                "type": "string",
                "description": "Short action phrase starting with a verb (e.g., 'Download form')."
            },
            "maxItems": 5
        }
    },
    "required": ["text", "recommended_actions"],
    "additionalProperties": False
}