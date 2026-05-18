import json


class ToolCallExtractor:

    @staticmethod
    def extract_openai_tool_calls(
        response_data: dict
    ):

        tool_calls = []

        for item in response_data.get("output", []):

            if item.get("type") == "function_call":

                tool_calls.append({
                    "name": item.get("name"),
                    "arguments": json.loads(
                        item.get("arguments", "{}")
                    ),
                    "call_id": item.get("call_id")
                })

        return tool_calls