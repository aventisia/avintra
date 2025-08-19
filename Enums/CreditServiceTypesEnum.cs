namespace AccountsAPIs.Enums;

/// <summary>
/// Defines available service types for AI processing, communication, speech tasks, and automated agent execution.
/// </summary>
public enum CreditServiceTypesEnum
{
    /// <summary>
    /// Local service for running LLM workloads on-premises.
    /// </summary>
    [Description("On-prem LLM")]
    OnPremLLM,

    /// <summary>
    /// Local speech-to-text conversion service.
    /// </summary>
    [Description("On-prem STT")]
    OnPremSTT,

    /// <summary>
    /// Local text-to-speech generation service.
    /// </summary>
    [Description("On-prem TTS")]
    OnPremTTS,

    /// <summary>
    /// Efficient AI processing using OpenAI 4o-mini model.
    /// </summary>
    [Description("OpenAI 4o-mini")]
    OpenAI4oMini,

    /// <summary>
    /// Email delivery and management via SendGrid.
    /// </summary>
    [Description("SendGrid Email")]
    SendGridEmail,

    /// <summary>
    /// WhatsApp messaging service via Twilio.
    /// </summary>
    [Description("Twilio WhatsApp")]
    TwilioWhatsApp,

    /// <summary>
    /// SMS sending and receiving via Twilio.
    /// </summary>
    [Description("Twilio SMS")]
    TwilioSMS,

    /// <summary>
    /// Text-to-speech generation using ElevenLabs.
    /// </summary>
    [Description("ElevenLabs TTS")]
    ElevenLabsTTS,

    /// <summary>
    /// Speech-to-text and TTS using Whisper.
    /// </summary>
    [Description("Whisper TTS")]
    WhisperTTS,

    /// <summary>
    /// Runs automated tasks using AI agents.
    /// </summary>
    [Description("Agent Execution")]
    AgentExecution
}