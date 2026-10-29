/**
 * Enum representing the available credit-based services for AI processing, communication, and execution tasks.
 * Synced with BE: CreditServicesEnum
 */
export enum CreditServicesEnum {
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
  // gemini-3.1-flash-lite
  Gemini31FlashLiteInput,
  Gemini31FlashLiteOutput,
  Gemini31FlashLiteCached,
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
  // OpenAI Embedding Models
  OpenAIEmbeddingAda002,
  OpenAIEmbedding3Small,
  // OpenRouter Embedding Models
  OpenRouterOpenAIEmbedding3Small,
  OpenRouterOpenAIEmbeddingAda002,
  // Other services
  ElevenLabsSTT,
  ElevenLabsTTS,
}
