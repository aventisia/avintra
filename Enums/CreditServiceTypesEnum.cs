namespace AccountsAPIs.Enums;

/// <summary>
/// Defines the available credit-based services for AI processing, communication, and execution tasks.
/// </summary>
public enum CreditServiceTypesEnum
{
    /// <summary>
    /// GPU-accelerated text processing service hosted on-premises.
    /// </summary>
    [Description("On-prem GPU-text")]
    OnPremGpuText,

    /// <summary>
    /// Input token processing for the GPT-4o Mini model.
    /// </summary>
    [Description("GPT 4o mini-input")]
    Gpt4oMiniInput,

    /// <summary>
    /// Output token generation for the GPT-4o Mini model.
    /// </summary>
    [Description("GPT 4o mini-output")]
    Gpt4oMiniOutput,

    /// <summary>
    /// Input token processing for the Gemini 2.5 Flash model.
    /// </summary>
    [Description("Gemini 2.5 Flash-input")]
    Gemini25FlashInput,

    /// <summary>
    /// Output token generation for the Gemini 2.5 Flash model.
    /// </summary>
    [Description("Gemini 2.5 Flash-output")]
    Gemini25FlashOutput,

    /// <summary>
    /// Service for executing autonomous agent workflows.
    /// </summary>
    [Description("Agent Executions")]
    AgentExecution,

    /// <summary>
    /// Service for executing AI model inference tasks.
    /// </summary>
    [Description("AI Model Executions")]
    AiModelExecution,

    /// <summary>
    /// Email communication service using SendGrid.
    /// </summary>
    [Description("SendGrid-Emails")]
    SendGridEmail,

    /// <summary>
    /// WhatsApp messaging service powered by Twilio.
    /// </summary>
    [Description("Twilio-Whatsapp")]
    TwilioWhatsApp,

    /// <summary>
    /// SMS messaging service powered by Twilio.
    /// </summary>
    [Description("Twilio-SMS")]
    TwilioSms,

    /// <summary>
    /// Speech-to-text service hosted on-premises.
    /// </summary>
    [Description("On-prem STT")]
    OnPremSTT,

    /// <summary>
    /// Text-to-speech service hosted on-premises.
    /// </summary>
    [Description("On-prem TTS")]
    OnPremTTS,

    /// <summary>
    /// Speech-to-text service provided by ElevenLabs.
    /// </summary>
    [Description("ElevenLabs STT")]
    ElevenLabsSTT,

    /// <summary>
    /// Text-to-speech service provided by ElevenLabs.
    /// </summary>
    [Description("ElevenLabs TTS")]
    ElevenLabsTTS
}