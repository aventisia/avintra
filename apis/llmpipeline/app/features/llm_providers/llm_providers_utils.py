import json

def extract_json_from_llm_response(text: str):
    """
    Extracts the first valid JSON object/array from the given text.
    Returns the parsed JSON object (dict/list).
    If JSON is not found, returns a structured fallback object with the raw text and error.
    """
    error_message = "LLM did not return valid JSON in the output."

    def _json_fallback(raw_text: str):
        return {
            "raw_text": raw_text,
            "error": error_message,
        }

    if text is None:
        return _json_fallback("")

    # Remove code block markers if present
    text = text.strip()
    if text.startswith('```json'):
        text = text[len('```json'):].strip()
    if text.startswith('```'):
        text = text[len('```'):].strip()
    if text.endswith('```'):
        text = text[:-3].strip()

    if not text:
        return _json_fallback("")

    # Try to decode JSON from the first object/array start token found in the text.
    decoder = json.JSONDecoder()
    for i, char in enumerate(text):
        if char not in ("{", "["):
            continue
        try:
            parsed_json, _ = decoder.raw_decode(text[i:])
            return parsed_json
        except json.JSONDecodeError:
            continue

    return _json_fallback(text)