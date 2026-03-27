export enum ServiceTypeEnum {
  "AgentExecutionTime" = "Agent Execution Time",
  // gpt-5.1
  "Gpt51Input" = "GPT 5.1-input",
  "Gpt51Output" = "GPT 5.1-output",
  "Gpt51Cached" = "GPT 5.1-cached",
  // gpt-5-mini
  "Gpt5MiniInput" = "GPT 5 mini-input",
  "Gpt5MiniOutput" = "GPT 5 mini-output",
  "Gpt5MiniCached" = "GPT 5 mini-cached",
  // gpt-5-nano
  "Gpt5NanoInput" = "GPT 5 nano-input",
  "Gpt5NanoOutput" = "GPT 5 nano-output",
  "Gpt5NanoCached" = "GPT 5 nano-cached",
  // gpt-4o
  "Gpt4oInput" = "GPT 4o-input",
  "Gpt4oOutput" = "GPT 4o-output",
  "Gpt4oCached" = "GPT 4o-cached",
  // gpt-4o-mini
  "Gpt4oMiniInput" = "GPT 4o mini-input",
  "Gpt4oMiniOutput" = "GPT 4o mini-output",
  "Gpt4oMiniCached" = "GPT 4o mini-cached",
  // gemini-2.5-flash
  "Gemini25FlashInput" = "Gemini 2.5 Flash-input",
  "Gemini25FlashOutput" = "Gemini 2.5 Flash-output",
  "Gemini25FlashCached" = "Gemini 2.5 Flash-cached",
  // gemini-2.5-flash-lite
  "Gemini25FlashLiteInput" = "Gemini 2.5 Flash Lite-input",
  "Gemini25FlashLiteOutput" = "Gemini 2.5 Flash Lite-output",
  "Gemini25FlashLiteCached" = "Gemini 2.5 Flash Lite-cached",
  // anthropic/claude-4.5-sonnet-20250929
  "Claude45SonnetInput" = "Claude 4.5 Sonnet-input",
  "Claude45SonnetOutput" = "Claude 4.5 Sonnet-output",
  "Claude45SonnetCached" = "Claude 4.5 Sonnet-cached",
  // x-ai/grok-3-mini
  "Grok3MiniInput" = "Grok 3 mini-input",
  "Grok3MiniOutput" = "Grok 3 mini-output",
  "Grok3MiniCached" = "Grok 3 mini-cached",
  // qwen/qwen3-vl-32b-instruct
  "Qwen3Vl32bInstructInput" = "Qwen3 VL 32b Instruct-input",
  "Qwen3Vl32bInstructOutput" = "Qwen3 VL 32b Instruct-output",
  // anthropic/claude-4.5-haiku-20251001
  "Claude45HaikuInput" = "Claude 4.5 Haiku-input",
  "Claude45HaikuOutput" = "Claude 4.5 Haiku-output",
  "Claude45HaikuCached" = "Claude 4.5 Haiku-cached",
  // Other services
  "ElevenLabsSTT" = "ElevenLabs STT",
  "ElevenLabsTTS" = "ElevenLabs TTS",
  "OlmOcrInput" = "Olm OCR Input",
  "OlmOcrOutput" = "Olm OCR Output",
  // TODO: Deprecated, Remove this later when no longer needed
  "OnPremSTT" = "On-prem STT",
  "OnPremTTS" = "On-prem TTS",
  "OnPremGpuText" = "On-prem GPU-text",
  "AIModelExecutionTime" = "AIModel Execution Time",
}
