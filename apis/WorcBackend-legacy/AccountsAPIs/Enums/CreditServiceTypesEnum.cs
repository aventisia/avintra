namespace AccountsAPIs.Enums;

/// <summary>
/// Defines the available credit-based services for AI processing, communication, and execution tasks.
/// </summary>
public enum CreditServiceTypesEnum
{
    [Description("Agent Execution Time")]
    AgentExecutionTime,

    // New LLM Providers (with Input, Output, Cached)
    [Description("GPT 4o mini-input")]
    Gpt4oMiniInput,

    [Description("GPT 4o mini-output")]
    Gpt4oMiniOutput,

    [Description("GPT 4o mini-cached")]
    Gpt4oMiniCached,

    [Description("qwen3-vl-32b-instruct - input")]
    Qwen3Vl32bInstructInput,

    [Description("qwen3-vl-32b-instruct - output")]
    Qwen3Vl32bInstructOutput,

    [Description("GPT 5.1-input")]
    Gpt51Input,

    [Description("GPT 5.1-output")]
    Gpt51Output,

    [Description("GPT 5.1-cached")]
    Gpt51Cached,

    [Description("GPT 5 mini-input")]
    Gpt5MiniInput,

    [Description("GPT 5 mini-output")]
    Gpt5MiniOutput,

    [Description("GPT 5 mini-cached")]
    Gpt5MiniCached,

    [Description("GPT 5 nano-input")]
    Gpt5NanoInput,

    [Description("GPT 5 nano-output")]
    Gpt5NanoOutput,

    [Description("GPT 5 nano-cached")]
    Gpt5NanoCached,

    [Description("Gemini 2.5 Flash input")]
    Gemini25FlashInput,

    [Description("Gemini 2.5 Flash output")]
    Gemini25FlashOutput,

    [Description("Gemini 2.5 Flash cached")]
    Gemini25FlashCached,

    [Description("Gemini 2.5 Flash Lite-input")]
    Gemini25FlashLiteInput,

    [Description("Gemini 2.5 Flash Lite-output")]
    Gemini25FlashLiteOutput,

    [Description("Gemini 2.5 Flash Lite-cached")]
    Gemini25FlashLiteCached,

    [Description("Claude 4.5 Sonnet-input")]
    Claude45SonnetInput,

    [Description("Claude 4.5 Sonnet-output")]
    Claude45SonnetOutput,

    [Description("Claude 4.5 Sonnet-cached")]
    Claude45SonnetCached,

    [Description("Claude 4.5 Haiku-input")]
    Claude45HaikuInput,

    [Description("Claude 4.5 Haiku-output")]
    Claude45HaikuOutput,

    [Description("Claude 4.5 Haiku-cached")]
    Claude45HaikuCached,

    [Description("Grok 3 mini-input")]
    Grok3MiniInput,

    [Description("Grok 3 mini-output")]
    Grok3MiniOutput,

    [Description("Grok 3 mini-cached")]
    Grok3MiniCached,

    // ---------------------------------------------------------
    // TODO: Remove this later when no longer needed

    [Description("On-prem STT")]
    OnPremSTT,

    [Description("On-prem TTS")]
    OnPremTTS,

    [Description("ElevenLabs STT")]
    ElevenLabsSTT,

    [Description("ElevenLabs TTS")]
    ElevenLabsTTS,

    [Description("GPT 4o-input")]
    Gpt4oInput,

    [Description("GPT 4o-output")]
    Gpt4oOutput,

    [Description("olmOCR-input")]
    OlmOcrInput,

    [Description("olmOCR-output")]
    OlmOcrOutput,

    [Description("On-prem GPU-text")]
    OnPremGpuText,

    [Description("AI Model Execution Time")]
    AIModelExecutionTime,
}