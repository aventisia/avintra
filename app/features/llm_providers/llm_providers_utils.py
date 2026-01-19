import json

def extract_json_from_llm_response(text: str):
    """
    Extracts the first valid JSON object from the given text.
    Returns the parsed JSON object (dict/list), or an empty string if not found.
    """
    # Remove code block markers if present
    text = text.strip()
    if text.startswith('```json'):
        text = text[len('```json'):].strip()
    if text.startswith('```'):
        text = text[len('```'):].strip()
    if text.endswith('```'):
        text = text[:-3].strip()

    # Try to find the first valid JSON object using a stack (handles nested braces)
    start = text.find('{')
    if start == -1:
        return ""
    stack = []
    for i in range(start, len(text)):
        if text[i] == '{':
            stack.append(i)
        elif text[i] == '}':
            if stack:
                stack.pop()
                if not stack:
                    json_str = text[start:i+1]
                    try:
                        json_obj = json.loads(json_str)
                        return json_obj  # Return parsed object instead of JSON string
                    except Exception:
                        pass
                    break
    return ""