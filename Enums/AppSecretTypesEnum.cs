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
    OneDriveCredentialApi
}