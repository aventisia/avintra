/**
 * Enum representing the available credit-based services for AI processing, communication, and execution tasks.
 */
export enum CreditServiceTypesEnum {
  AgentExecutionTime,
  Gpt4oMiniInput,
  Gpt4oMiniOutput,
  Gpt4oMiniCached,

  Qwen3Vl32bInstructInput,
  Qwen3Vl32bInstructOutput,

  Gpt51Input,
  Gpt51Output,
  Gpt51Cached,

  Gpt5MiniInput,
  Gpt5MiniOutput,
  Gpt5MiniCached,

  Gpt5NanoInput,
  Gpt5NanoOutput,
  Gpt5NanoCached,

  Gemini25FlashInput,
  Gemini25FlashOutput,
  Gemini25FlashCached,

  Gemini25FlashLiteInput,
  Gemini25FlashLiteOutput,
  Gemini25FlashLiteCached,

  Claude45SonnetInput,
  Claude45SonnetOutput,
  Claude45SonnetCached,

  Claude45HaikuInput,
  Claude45HaikuOutput,
  Claude45HaikuCached,

  Grok3MiniInput,
  Grok3MiniOutput,
  Grok3MiniCached,

  // ---------------------------------------------------------
  // TODO: Remove this later when no longer needed

  /**
   * Speech-to-text service hosted on-premises.
   */
  OnPremSTT,

  /**
   * Text-to-speech service hosted on-premises.
   */
  OnPremTTS,

  /**
   * Speech-to-text service provided by ElevenLabs.
   */
  ElevenLabsSTT,

  /**
   * Text-to-speech service provided by ElevenLabs.
   */
  ElevenLabsTTS,

  /**
   * Input token processing for the GPT-4o model.
   */
  Gpt4oInput,

  /**
   * Output token generation for the GPT-4o model.
   */
  Gpt4oOutput,

  /**
   * Input OCR processing for the olmOCR model.
   */
  OlmOcrInput,

  /**
   * Output OCR generation for the olmOCR model.
   */
  OlmOcrOutput,

  /**
   * GPU-accelerated text processing service hosted on-premises.
   */
  OnPremGpuText,

  /**
   * Service for executing AI model inference tasks.
   */
  AIModelExecutionTime,
}
