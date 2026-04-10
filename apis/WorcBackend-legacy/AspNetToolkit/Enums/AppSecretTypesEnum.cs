namespace AspNetToolkit.Enums;

/// <summary>
/// Specifies the types of application secrets used to integrate with third-party services, such as API keys for external platforms or tools.
/// </summary>
public enum AppSecretTypesEnum
{
    /// <summary>
    /// API key used to access OpenAI services like GPT models, embeddings, or image generation.
    /// </summary>
    [Description("OpenAI API Key")]
    OpenAI,

    /// <summary>
    /// AWS credentials used to access services like S3, Lambda, Rekognition, etc.
    /// </summary>
    [Description("AWS Credentials")]
    AWS,

    /// <summary>
    /// Twilio credentials for messaging, voice, or other communication services.
    /// </summary>
    [Description("Twilio API Credentials")]
    Twilio,

    /// <summary>
    /// API key used to authenticate with SendGrid for sending emails.
    /// </summary>
    [Description("SendGrid API Key")]
    SendGrid,

    /// <summary>
    /// Personal Access Token used to authenticate with the GitHub API.
    /// </summary>
    [Description("GitHub API Key")]
    GitHub,

    /// <summary>
    /// Represents the credentials required for Microsoft 365 services.
    /// </summary>
    [Description("M365 Credentials")]
    M365,

    /// <summary>
    /// Represents general credentials used for various services.
    /// </summary>
    [Description("General Credentials")]
    GeneralCredentials,

    /// <summary>
    /// Represents the credentials needed for integrating with Anthropic services.
    /// </summary>
    [Description("Anthropic Credentials")]
    Anthropic,

    /// <summary>
    /// Represents the credentials required for Google Gemini API integration.
    /// </summary>
    [Description("Google Gemini Credentials")]
    GoogleGemini,

    /// <summary>
    /// Represents the credentials needed for integrating with Google Workspace services.
    /// </summary>
    [Description("Google Workspace Credentials")]
    GoogleWorkspace,

    /// <summary>
    /// Represents the credentials required for Azure OpenAI API integration.
    /// </summary>
    [Description("Azure OpenAI Credentials")]
    AzureOpenAI,

    /// <summary>
    /// Represents the credentials required for integrating with ElevenLabs API.
    /// </summary>
    [Description("ElevenLabs Credentials")]
    ElevenLabs,

    /// <summary>
    /// Represents the credentials required for integrating with OpenRouter API.
    /// </summary>
    [Description("OpenRouter Credentials")]
    OpenRouter,

    /// <summary>
    /// Represents the credentials required for integrating with Azure Storage.
    /// </summary>
    [Description("Azure Storage Credentials")]
    AzureStorage,

    /// <summary>
    /// Represents credentials required to access a data source using a connection string.
    /// </summary>
    [Description("Connection String Credentials")]
    ConnectionString,

    /// <summary>
    /// Represents the credentials required for Qdrant vector database access.
    /// </summary>
    [Description("Qdrant Credentials")]
    Qdrant,

    EmailClient,
    AzureBlobStorage
}
