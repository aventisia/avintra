/**
 * Enum representing the available credit-based services for AI processing, communication, and execution tasks.
 */
export enum CreditServiceTypesEnum {
  AgentExecutionTime,
  Gpt4oMiniInput,
  Gpt4oMiniOutput,
  Qwen3Vl32bInstructInput,
  Qwen3Vl32bInstructOutput,

  // -----------------------------------------------------
  // TODO: TO remvoe later

  /**
   * GPU-accelerated text processing service hosted on-premises.
   */
  OnPremGpuText,

  /**
   * Input token processing for the Gemini 2.5 Flash model.
   */
  Gemini25FlashInput,

  /**
   * Output token generation for the Gemini 2.5 Flash model.
   */
  Gemini25FlashOutput,

  /**
   * Service for executing AI model inference tasks.
   */
  AIModelExecutionTime,

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
}
