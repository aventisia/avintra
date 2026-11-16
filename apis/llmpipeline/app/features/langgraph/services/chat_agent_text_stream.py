import re

_TEXT_KEY = re.compile(r'"text"\s*:\s*"')
_ESCAPES = {
    '"': '"',
    "\\": "\\",
    "/": "/",
    "b": "\b",
    "f": "\f",
    "n": "\n",
    "r": "\r",
    "t": "\t",
}


class ChatAgentTextStream:
    """Turns a chat agent's streamed tokens into the user-visible text as it arrives.

    JSON-mode replies stream the value of each ``"text"`` field; any other reply
    streams as-is.
    """

    def __init__(self) -> None:
        self._buffer = ""
        self._pos = 0
        self._is_json: bool | None = None
        self._in_text = False
        self.text = ""

    def feed(self, chunk: str) -> str:
        """Adds a token chunk and returns the newly visible text."""
        self._buffer += chunk
        if self._is_json is None:
            head = self._buffer.lstrip()
            if not head:
                return ""
            self._is_json = head[0] in "{[`"

        if self._is_json:
            visible = self._read_text_fields()
        else:
            visible = self._buffer[self._pos :]
            self._pos = len(self._buffer)
        self.text += visible
        return visible

    def _read_text_fields(self) -> str:
        buffer = self._buffer
        out: list[str] = []
        while self._pos < len(buffer):
            if not self._in_text:
                match = _TEXT_KEY.search(buffer, self._pos)
                if match is None:
                    self._pos = max(self._pos, len(buffer) - 32)
                    break
                self._pos = match.end()
                self._in_text = True
                continue

            char = buffer[self._pos]
            if char == '"':
                self._in_text = False
                self._pos += 1
            elif char != "\\":
                out.append(char)
                self._pos += 1
            else:
                decoded, length = self._decode_escape(buffer, self._pos)
                if decoded is None:
                    break
                out.append(decoded)
                self._pos += length
        return "".join(out)

    @staticmethod
    def _decode_escape(buffer: str, pos: int) -> tuple[str | None, int]:
        """Decodes the escape at ``pos``, or returns ``None`` until it is complete."""
        if pos + 1 >= len(buffer):
            return None, 0
        kind = buffer[pos + 1]
        if kind != "u":
            return _ESCAPES.get(kind, kind), 2
        if pos + 6 > len(buffer):
            return None, 0
        code = int(buffer[pos + 2 : pos + 6], 16)
        if 0xD800 <= code < 0xDC00:
            if pos + 12 > len(buffer):
                return None, 0
            if buffer[pos + 6 : pos + 8] == "\\u":
                low = int(buffer[pos + 8 : pos + 12], 16)
                if 0xDC00 <= low < 0xE000:
                    return chr(0x10000 + ((code - 0xD800) << 10) + (low - 0xDC00)), 12
        return chr(code), 6
