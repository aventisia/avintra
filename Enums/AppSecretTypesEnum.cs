namespace AspNetToolkit.Entities;

/// <summary>
/// Specifies the types of application secrets used to integrate with third-party services, such as API keys for external platforms or tools.
/// </summary>
public enum AppSecretTypesEnum
{
    /// <summary>
    /// API key used to access OpenAI services like GPT models, embeddings, or image generation.
    /// </summary>
    [Description("OpenAI API Key")]
    OpenAiApi,

    /// <summary>
    /// AWS credentials used to access services like S3, Lambda, Rekognition, etc.
    /// </summary>
    [Description("AWS Credentials")]
    Aws,

    /// <summary>
    /// Twilio credentials for messaging, voice, or other communication services.
    /// </summary>
    [Description("Twilio API Credentials")]
    TwilioApi,

    /// <summary>
    /// API key used to authenticate with SendGrid for sending emails.
    /// </summary>
    [Description("SendGrid API Key")]
    SendGridApi,

    /// <summary>
    /// Personal Access Token used to authenticate with the GitHub API.
    /// </summary>
    [Description("GitHub API Key")]
    GitHubApi,

    [Description("General Credentials")]
    GeneralCredentialApi,



    // TODO: @mayuri needs to verify if this is needed or not. Currently added to avoid build errors.
    [Description("OneDrive API Key")]
    OneDriveCredentialApi,

    /// <summary>
    /// Represents the API key used to authenticate with Anthropic's AI models.
    /// </summary>
    [Description("Anthropic API Key")]
    AnthropicApi,

    /// <summary>
    /// Represents the API key used to connect with Google's Gemini AI platform.
    /// </summary>
    [Description("Google Gemini API Key")]
    GoogleGeminiApi,

    /// <summary>
    /// Represents credentials or configuration for integrating with Google Workspace (e.g., Gmail, Drive, Calendar).
    /// </summary>
    [Description("Google Workspace")]
    GoogleWorkspaceApi,

    /// <summary>
    ///Represents the API key used to authenticate with Azure-hosted OpenAI services (e.g., GPT models via Azure).
    /// </summary>
    [Description("Azure Open AI API Key")]
    AzureOpenAiApi

}