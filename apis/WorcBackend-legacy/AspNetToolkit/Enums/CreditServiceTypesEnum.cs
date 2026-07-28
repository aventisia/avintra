namespace AspNetToolkit.Enums;

/// <summary>
/// Defines the available credit-based services for AI processing, communication, and execution tasks.
/// </summary>
public enum CreditServicesEnum
{
    AgentExecutionTime,
    // gpt-5.1
    Gpt51Input,
    Gpt51Output,
    Gpt51Cached,
    // gpt-5-mini
    Gpt5MiniInput,
    Gpt5MiniOutput,
    Gpt5MiniCached,
    // gpt-5-nano
    Gpt5NanoInput,
    Gpt5NanoOutput,
    Gpt5NanoCached,
    // gpt-4o
    Gpt4oInput,
    Gpt4oOutput,
    Gpt4oCached,
    // gpt-4o-mini
    Gpt4oMiniInput,
    Gpt4oMiniOutput,
    Gpt4oMiniCached,
    // gemini-2.5-flash
    Gemini25FlashInput,
    Gemini25FlashOutput,
    Gemini25FlashCached,
    // gemini-2.5-flash-lite
    Gemini25FlashLiteInput,
    Gemini25FlashLiteOutput,
    Gemini25FlashLiteCached,
    // anthropic/claude-4.5-sonnet-20250929
    Claude45SonnetInput,
    Claude45SonnetOutput,
    Claude45SonnetCached,
    // x-ai/grok-3-mini
    Grok3MiniInput,
    Grok3MiniOutput,
    Grok3MiniCached,
    // qwen/qwen3-vl-32b-instruct
    Qwen3Vl32bInstructInput,
    Qwen3Vl32bInstructOutput,
    // anthropic/claude-4.5-haiku-20251001
    Claude45HaikuInput,
    Claude45HaikuOutput,
    Claude45HaikuCached,

    // Embedding models
    OpenAIEmbeddingAda002,
    OpenAIEmbedding3Small,
    OpenRouterOpenAIEmbedding3Small,
    OpenRouterOpenAIEmbeddingAda002,
    // ===== ElevenLabs STT Models =====
    ElevenLabsScribeV1,
    ElevenLabsScribeV2,
    ElevenLabsScribeV2Realtime,

    // ===== ElevenLabs TTS Models =====
    ElevenLabsV3,
    ElevenLabsMultilingualV2,
    ElevenLabsMultilingualV3,
    ElevenLabsTurboV2,
    ElevenLabsFlashV2,
    ElevenLabsEnglishV2,

    // Other services
    ElevenLabsSTT,
    ElevenLabsTTS,
}
