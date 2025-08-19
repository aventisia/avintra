namespace WorkspaceAPIs.DTOs;

#region -------------------- OpenAiApiCredentialsDto --------------------

/// <summary>
/// Represents the credentials and configuration required to authenticate with the OpenAI API.
/// </summary>
public class OpenAiApiCredentialsDto
{
    /// <summary>
    /// Gets or sets the API key used for authenticating requests to the OpenAI API.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the optional organization ID associated with the OpenAI account.
    /// </summary>
    public string? OrganizationId { get; set; }

    /// <summary>
    /// Gets or sets the base URL of the OpenAI API. Defaults to "https://api.openai.com/v1".
    /// </summary>
    public string Url { get; set; } = "https://api.openai.com/v1";
}
#endregion

#region -------------------- AwsCredentialsDto --------------------

/// <summary>
/// Contains AWS access credentials and related configuration settings.
/// </summary>
public class AwsCredentialsDto
{
    /// <summary>
    /// Gets or sets the AWS region to be used (e.g., "us-east-1").
    /// </summary>
    public string Region { get; set; } = "us-east-1";

    /// <summary>
    /// Gets or sets the AWS access key ID used for authentication.
    /// </summary>
    public string AccessKeyId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the AWS secret access key used for authentication.
    /// </summary>
    public string SecretAccessKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether temporary security credentials are being used.
    /// </summary>
    public bool TemporarySecurityCredentials { get; set; }

    /// <summary>
    /// Gets or sets the session token used with temporary credentials.
    /// </summary>
    public string SessionToken { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets a value indicating whether custom service endpoints are configured.
    /// </summary>
    public bool CustomEndpoints { get; set; }

    /// <summary>
    /// Gets or sets the custom endpoint URL for the Amazon Rekognition service.
    /// </summary>
    public string RekognitionEndpoint { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the custom endpoint URL for the AWS Lambda service.
    /// </summary>
    public string LambdaEndpoint { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the custom endpoint URL for the Amazon SNS (Simple Notification Service).
    /// </summary>
    public string SnsEndpoint { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the custom endpoint URL for the Amazon SES (Simple Email Service).
    /// </summary>
    public string SesEndpoint { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the custom endpoint URL for the Amazon SQS (Simple Queue Service).
    /// </summary>
    public string SqsEndpoint { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the custom endpoint URL for the Amazon S3 (Simple Storage Service).
    /// </summary>
    public string S3Endpoint { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the custom endpoint URL for the AWS Systems Manager (SSM) service.
    /// </summary>
    public string SsmEndpoint { get; set; } = string.Empty;
}

#endregion

#region -------------------- TwilioCredentialsDto --------------------

/// <summary>
/// Represents credentials required to authenticate with the Twilio API.
/// Supports both Auth Token and API Key authentication methods.
/// </summary>
public class TwilioCredentialsDto
{
    /// <summary>
    /// Gets or sets the authentication method to use (AuthToken or ApiKey).
    /// </summary>
    public string AuthType { get; set; } = nameof(AuthenticationType.AuthToken);

    /// <summary>
    /// Gets or sets the Twilio Account SID. Required for all authentication types.
    /// </summary>
    public string AccountSid { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the Auth Token from the Twilio Console.
    /// Used when AuthType is set to AuthToken.
    /// </summary>
    public string AuthToken { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API Key SID from the Twilio Console.
    /// Used when AuthType is set to ApiKey.
    /// </summary>
    public string ApiKeySid { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API Key Secret from the Twilio Console.
    /// Used when AuthType is set to ApiKey.
    /// </summary>
    public string ApiKeySecret { get; set; } = string.Empty;
}

// -------------------- AuthenticationType --------------------

/// <summary>
/// Specifies the supported authentication methods for Twilio API integration.
/// </summary>
public enum AuthenticationType
{
    /// <summary>
    /// Authenticate using an Auth Token.
    /// </summary>
    AuthToken,

    /// <summary>
    /// Authenticate using an API Key and Secret.
    /// </summary>
    ApiKey
}

#endregion

#region -------------------- SendGridCredentialsDto --------------------

/// <summary>
/// Represents the credentials required to authenticate with the SendGrid API.
/// </summary>
public class SendGridCredentialsDto
{
    /// <summary>
    /// Gets or sets the API key used for authenticating requests to the SendGrid API.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}

#endregion
