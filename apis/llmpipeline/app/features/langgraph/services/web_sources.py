from typing import Any
from urllib.parse import urlparse


class SourceCollector:
    def __init__(self) -> None:
        self._sources: dict[str, dict[str, str]] = {}

    def add(self, chunk: Any) -> list[int]:
        """Records the chunk's sources and returns the numbers its Anthropic citations point at, in order."""
        numbers: list[int] = []
        content = getattr(chunk, "content", None)
        if not isinstance(content, list):
            return numbers
        for block in content:
            if not isinstance(block, dict):
                continue
            for key in ("citations", "annotations"):
                citations = block.get(key)
                if not isinstance(citations, list):
                    continue
                for citation in citations:
                    number = self._add_citation(citation)
                    # IMPORTANT NOTE: OpenAI streams annotations on the one block that holds the whole reply,
                    # so they give no place for a marker; they only add to the Sources row.
                    if key == "citations" and number and number not in numbers:
                        numbers.append(number)
        return numbers

    def sources(self) -> list[dict[str, str]]:
        return list(self._sources.values())

    def _add_citation(self, citation: Any) -> int | None:
        if not isinstance(citation, dict):
            return None
        if citation.get("type") not in ("web_search_result_location", "url_citation"):
            return None
        url = citation.get("url")
        if not isinstance(url, str):
            return None
        if url in self._sources:
            return list(self._sources).index(url) + 1
        try:
            parsed = urlparse(url)
        except ValueError:
            return None
        host = (parsed.hostname or "").removeprefix("www.")
        if parsed.scheme not in ("http", "https") or not host:
            return None
        title = citation.get("title")
        self._sources[url] = {
            "title": title if isinstance(title, str) and title.strip() else host,
            "url": url,
            "domain": host,
        }
        return len(self._sources)


class CitationMarkers:
    """Holds the `[n]` markers of a cited block until its text has streamed, then releases them."""

    def __init__(self) -> None:
        self._numbers: list[int] = []
        self._block: Any = None
        self._held = ""
        self._ends_with_space = True

    def before(self, chunk: Any) -> str:
        block = self._block_index(chunk)
        if self._numbers and block is not None and block != self._block:
            return self.flush()
        return ""

    def track(self, chunk: Any, text: str, numbers: list[int]) -> str:
        """Queues the chunk's markers and returns its text, minus trailing whitespace held back for the marker."""
        if numbers:
            self._numbers.extend(number for number in numbers if number not in self._numbers)
            self._block = self._block_index(chunk)
        if self._numbers:
            text = self._held + text
            body = text.rstrip()
            self._held = text[len(body) :]
            text = body
        if text:
            self._ends_with_space = text[-1].isspace()
        return text

    def flush(self) -> str:
        if not self._numbers:
            return ""
        marker = ("" if self._ends_with_space else " ") + "".join(f"[{n}]" for n in self._numbers)
        marker += self._held
        self._ends_with_space = bool(self._held)
        self._numbers = []
        self._held = ""
        return marker

    @staticmethod
    def _block_index(chunk: Any) -> Any:
        content = getattr(chunk, "content", None)
        if not isinstance(content, list):
            return None
        return next((b.get("index") for b in content if isinstance(b, dict) and "index" in b), None)
