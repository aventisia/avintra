/**
 * Enum representing the available credit-based services for AI processing, communication, and execution tasks.
 */
export enum CreditServiceTypesEnum {
  /**
   * GPU-accelerated text processing service hosted on-premises.
   */
  OnPremGpuText,

  /**
   * Input token processing for the GPT-4o Mini model.
   */
  Gpt4oMiniInput,

  /**
   * Output token generation for the GPT-4o Mini model.
   */
  Gpt4oMiniOutput,

  /**
   * Input token processing for the Gemini 2.5 Flash model.
   */
  Gemini25FlashInput,

  /**
   * Output token generation for the Gemini 2.5 Flash model.
   */
  Gemini25FlashOutput,

  /**
   * Service for executing autonomous agent workflows.
   */
  AgentExecutionTime,

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
