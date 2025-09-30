/**
 * Enum representing the available credit-based services for AI processing, communication, and execution tasks.
 */
export enum CreditServiceTypesEnum {
  /**
   * GPU-accelerated text processing service hosted on-premises.
   */
  OnPremGpuText = "OnPremGpuText",

  /**
   * Input token processing for the GPT-4o Mini model.
   */
  Gpt4oMiniInput = "Gpt4oMiniInput",

  /**
   * Output token generation for the GPT-4o Mini model.
   */
  Gpt4oMiniOutput = "Gpt4oMiniOutput",

  /**
   * Input token processing for the Gemini 2.5 Flash model.
   */
  Gemini25FlashInput = "Gemini25FlashInput",

  /**
   * Output token generation for the Gemini 2.5 Flash model.
   */
  Gemini25FlashOutput = "Gemini25FlashOutput",

  /**
   * Service for executing autonomous agent workflows.
   */
  AgentExecution = "AgentExecution",

  /**
   * Service for executing AI model inference tasks.
   */
  AiModelExecution = "AiModelExecution",

  /**
   * Email communication service using SendGrid.
   */
  SendGridEmail = "SendGridEmail",

  /**
   * WhatsApp messaging service powered by Twilio.
   */
  TwilioWhatsApp = "TwilioWhatsApp",

  /**
   * SMS messaging service powered by Twilio.
   */
  TwilioSms = "TwilioSms",

  /**
   * Speech-to-text service hosted on-premises.
   */
  OnPremSTT = "OnPremSTT",

  /**
   * Text-to-speech service hosted on-premises.
   */
  OnPremTTS = "OnPremTTS",

  /**
   * Speech-to-text service provided by ElevenLabs.
   */
  ElevenLabsSTT = "ElevenLabsSTT",

  /**
   * Text-to-speech service provided by ElevenLabs.
   */
  ElevenLabsTTS = "ElevenLabsTTS",
}
