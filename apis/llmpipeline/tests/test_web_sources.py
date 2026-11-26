"""Citations from a searched reply become one de-duplicated `sources` frame before `done`."""

import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch

from langchain_core.messages import AIMessageChunk

from app.features.langgraph.services.web_sources import SourceCollector
from app.features.llm_providers.llm_providers_schemas import LLMRequest


def _anthropic(*urls: tuple[str, str | None], index: int = 1) -> AIMessageChunk:
    return AIMessageChunk(
        content=[
            {
                "type": "text",
                "index": index,
                "citations": [
                    {"type": "web_search_result_location", "url": url, "title": title,
                     "cited_text": "c", "encrypted_index": "e"}
                    for url, title in urls
                ],
            }
        ]
    )


def _openai(url: str, title: str | None = "B") -> AIMessageChunk:
    annotation = {"type": "url_citation", "url": url, "start_index": 0, "end_index": 1}
    if title is not None:
        annotation["title"] = title
    return AIMessageChunk(content=[{"type": "text", "index": 0, "annotations": [annotation]}])


def _sources(*chunks) -> list[dict]:
    collector = SourceCollector()
    for chunk in chunks:
        collector.add(chunk)
    return collector.sources()


def test_anthropic_citation_becomes_a_source():
    assert _sources(_anthropic(("https://www.example.com/a", "Example A"))) == [
        {"title": "Example A", "url": "https://www.example.com/a", "domain": "example.com"}
    ]


def test_openai_annotation_becomes_a_source():
    assert _sources(_openai("https://news.site.org/x")) == [
        {"title": "B", "url": "https://news.site.org/x", "domain": "news.site.org"}
    ]


def test_same_url_cited_twice_is_one_source():
    result = _sources(_anthropic(("https://a.com/p", "A")), _anthropic(("https://a.com/p", "A")))
    assert [source["url"] for source in result] == ["https://a.com/p"]


def test_missing_title_falls_back_to_the_domain():
    assert _sources(_openai("https://b.com/x", title=None))[0]["title"] == "b.com"
    assert _sources(_anthropic(("https://b.com/x", None)))[0]["title"] == "b.com"


def test_unsafe_and_malformed_urls_are_dropped():
    result = _sources(
        _anthropic(("javascript:alert(1)", "bad"), ("not a url", "worse"), ("https://ok.com", "Ok"))
    )
    assert [source["url"] for source in result] == ["https://ok.com"]


def test_chunks_without_citations_add_nothing_and_never_raise():
    collector = SourceCollector()
    for chunk in (
        AIMessageChunk(content="plain"),
        AIMessageChunk(content=[{"type": "text", "text": "hi"}]),
        AIMessageChunk(content=[{"type": "text", "citations": "oops"}]),
        AIMessageChunk(content=[{"type": "text", "annotations": [None, 3, {"type": "url_citation"}]}]),
        SimpleNamespace(content=None),
        object(),
    ):
        collector.add(chunk)
    assert collector.sources() == []


def test_sources_keep_first_use_order():
    result = _sources(
        _anthropic(("https://b.com", "B")),
        _openai("https://a.com", "A"),
        _anthropic(("https://b.com", "B"), ("https://c.com", "C")),
    )
    assert [source["url"] for source in result] == ["https://b.com", "https://a.com", "https://c.com"]


USER = SimpleNamespace(access_token="jwt", env_type=None, tenant_id=None, space_id=None)


def _stream_frames(chunks: list[AIMessageChunk]) -> list[tuple[str, object]]:
    from app.features.langgraph.services import chat_service
    from app.features.langgraph.services.chat_service import ChatService
    from app.features.langgraph.skills.skill_registry import SkillRegistry
    from app.features.langgraph.tools.tool_registry import ToolRegistry

    class FakeGraph:
        async def astream_events(self, *_args, **_kwargs):
            for chunk in chunks:
                yield {
                    "event": "on_chat_model_stream",
                    "data": {"chunk": chunk},
                    "metadata": {"langgraph_node": "model"},
                }

        async def aget_state(self, _config):
            return SimpleNamespace(values={"messages": []}, tasks=(), next=())

    service = ChatService(ToolRegistry(), SkillRegistry(), conversation_service=None)
    request = LLMRequest(
        provider="anthropic",
        model="claude-sonnet-5-5",
        input="hi",
        conversation_id="c1",
        action="LandingChat",
        is_temp_chat=True,
    )

    async def collect():
        return [
            (frame.type, frame.output)
            async for frame in service._stream_normalized_impl(request, USER, None)
        ]

    with (
        patch.object(service, "_graph", return_value=FakeGraph()),
        patch.object(service, "_clear_stale_approvals", AsyncMock(return_value=([], True))),
        patch.object(service, "_prepare_input", AsyncMock(return_value=([], [], set()))),
        patch.object(
            service,
            "_create_final_response",
            return_value=SimpleNamespace(output="Answer [1]"),
        ),
        patch.object(chat_service, "pending_approval_tool_calls", return_value=[]),
    ):
        return asyncio.run(collect())


def _stream_types(chunks: list[AIMessageChunk]) -> list[str]:
    return [frame_type for frame_type, _ in _stream_frames(chunks)]


def test_sources_frame_precedes_done():
    types = _stream_types(
        [AIMessageChunk(content="Answer [1]"), _anthropic(("https://a.com", "A"))]
    )
    assert types.count("sources") == 1
    assert types.index("sources") < types.index("done")


def test_no_sources_frame_without_citations():
    assert "sources" not in _stream_types([AIMessageChunk(content="Answer")])


def test_add_returns_the_numbers_of_the_sources_a_chunk_cites():
    collector = SourceCollector()
    assert collector.add(_anthropic(("https://a.com", "A"), ("https://b.com", "B"))) == [1, 2]
    assert collector.add(_anthropic(("https://b.com", "B"), ("https://c.com", "C"))) == [2, 3]
    assert collector.add(_anthropic(("https://b.com", "B"), ("https://b.com", "B"))) == [2]
    assert collector.add(AIMessageChunk(content="plain")) == []


def _text(text: str, index: int) -> AIMessageChunk:
    return AIMessageChunk(content=[{"type": "text", "index": index, "text": text}])


def test_marker_follows_the_cited_block_not_its_citation():
    frames = _stream_frames(
        [
            _text("Intro.\n\n", 0),
            _anthropic(("https://a.com", "A"), ("https://b.com", "B"), index=1),
            _text("Verstappen won.", 1),
            _text("\n\n", 2),
            _anthropic(("https://a.com", "A"), index=3),
            _text("Norris was second.", 3),
        ]
    )
    deltas = [output for frame_type, output in frames if frame_type == "delta"]
    assert deltas == [
        "Intro.\n\n",
        "Verstappen won.",
        " [1][2]",
        "\n\n",
        "Norris was second.",
        " [1]",
    ]


def test_marker_goes_before_the_whitespace_a_cited_block_ends_with():
    frames = _stream_frames(
        [_anthropic(("https://a.com", "A"), index=0), _text("Done.\n", 0), _text("Next", 1)]
    )
    deltas = [output for frame_type, output in frames if frame_type == "delta"]
    assert deltas == ["Done.", " [1]\n", "Next"]


def test_openai_annotations_add_sources_but_no_markers():
    collector = SourceCollector()

    assert collector.add(_openai("https://a.com")) == []
    assert [source["url"] for source in collector.sources()] == ["https://a.com"]
