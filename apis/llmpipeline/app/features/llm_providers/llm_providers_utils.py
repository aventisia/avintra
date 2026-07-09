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

def extract_error_message(exception) -> str:
    """
    Extracts the most descriptive error message from an exception.

    Attempts to parse a structured error payload from exception.response
    when available, falling back to the exception text otherwise.
    """
    # Default to the exception message when no structured response is available.
    error_message = str(exception)

    # Check if the exception contains an HTTP response object.
    response = getattr(exception, "response", None)
    if not response:
        return error_message

    try:
        # Extract the response content containing the error details.
        error_obj = getattr(response, "content", None)
        if not error_obj:
            return error_message

        # Parse the response content into a dictionary if it is JSON.
        if isinstance(error_obj, (str, bytes)):
            error_data = json.loads(error_obj)
        elif isinstance(error_obj, dict):
            error_data = error_obj
        else:
            # Unsupported response format; use the original exception message.
            return error_message

        # Extract the most specific error message available from the payload.
        return (
            error_data.get("error", {}).get("message")
            or error_data.get("error")
            or error_data.get("message")
            or error_data.get("detail")
            or str(error_obj)
        )

    except Exception:
        # If parsing fails, fall back to the original exception message.
        return error_message