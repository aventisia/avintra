namespace WorkspaceAPIs.DTOs;

#region -------------------- OpenAICredentialsDto --------------------

/// <summary>
/// Represents the credentials and configuration required to authenticate with the OpenAI API.
/// </summary>
public class OpenAICredentialsDto
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

#region -------------------- AWSCredentialsDto --------------------

/// <summary>
/// Contains AWS access credentials and related configuration settings.
/// </summary>
public class AWSCredentialsDto
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

public class GitHubCredentialsDto
{
    /// <summary>
    /// Gets or sets the GitHub username associated with the personal access token.
    /// </summary>
    public string Server { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the user identifier in your application or system.
    /// This may differ from the GitHub username.
    /// </summary>
    public string User { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the GitHub Personal Access Token (PAT) used for authenticating requests to the GitHub API.
    /// </summary>
    public string AccessToken { get; set; } = string.Empty;
}

public class GeneralCredentialsDto
{
    /// <summary>
    /// Gets or sets the username associated with the credentials.
    /// This may be null if the username is not provided.
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the password associated with the credentials.
    /// This may be null if the password is not provided.
    /// </summary>
    public string Password { get; set; } = string.Empty;

}
#endregion

/// <summary>
/// Represents the credentials and URLs needed for OAuth authentication with OneDrive.
/// </summary>
/// 
public class OneDriveCredentialsDto
{
    /// <summary>
    /// URL to which the OAuth provider will redirect after successful authentication.
    /// This is typically used for the callback after the user grants permission.
    /// </summary>
    public string OAuthRedirectURL { get; set; } = string.Empty;

    /// <summary>
    /// URL for the authorization request to obtain an authorization code.
    /// This is where the user is redirected to grant permission to your application.
    /// </summary>
    public string AuthorizationURL { get; set; } = string.Empty;

    /// <summary>
    /// The access token used to authenticate API requests after the authorization step.
    /// This token allows the application to access the user's OneDrive data.
    /// </summary>
    public string AccessTokenURL { get; set; } = string.Empty;

    /// <summary>
    /// The client ID assigned to your application by the OAuth provider (e.g., OneDrive).
    /// This uniquely identifies your application during the authentication process.
    /// </summary>
    public string ClientID { get; set; } = string.Empty;

    /// <summary>
    /// The client secret assigned to your application by the OAuth provider (e.g., OneDrive).
    /// This secret is used alongside the client ID to authenticate your application.       
    public string ClientSecret { get; set; } = string.Empty;
}

/// <summary>
/// Data Transfer Object (DTO) that contains credentials required 
/// for authenticating and connecting to Microsoft 365 (M365) services 
/// such as Microsoft Graph API or Exchange Online.
/// </summary>
public class M365CredentialsDto
{
    /// <summary>
    /// The Azure Active Directory (AAD) tenant ID associated with the Microsoft 365 organization.
    /// This uniquely identifies your tenant within Azure AD.
    /// </summary>
    public string AzureTenantId { get; set; } = string.Empty;

    /// <summary>
    /// The client (application) ID registered in Azure Active Directory.
    /// This is used to identify your application during the OAuth2 authentication process.
    /// </summary>
    public string ClientId { get; set; } = string.Empty;

    /// <summary>
    /// The client secret (application password) generated in Azure AD for the registered app.
    /// This value is used along with the Client ID to securely authenticate your application.
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;
}

/// <summary>
/// Represents the credentials required to authenticate requests to the Anthropic API.
/// </summary>
public class AnthropicCredentialsDto
{
    /// <summary>
    /// Gets or sets the API key used for authenticating requests to the Anthropic API.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>
/// Represents the credentials and configuration required to authenticate requests 
/// to the Google Gemini API.
/// </summary>
public class GoogleGeminiCredentialsDto
{
    /// <summary>
    /// Gets or sets the base URL or host address for the Google Gemini API.
    /// </summary>
    public string Host { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API key used for authenticating requests to the Google Gemini API.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>
/// This DTO is used to store the necessary configuration values such as the OAuth redirect URL, 
/// client ID, and client secret, which are required for authenticating and authorizing access 
/// to Google services like Google Calendar, Google Docs, and other Workspace APIs.
/// </summary>
public class GoogleWorkspaceCredentialsDto
{
    /// <summary>
    /// The redirect URI configured in the Google Cloud Console for your OAuth 2.0 client.
    /// </summary>
    public string OAuthRedirectURL { get; set; } = string.Empty;

    /// <summary>
    ///  /// The client ID assigned to your application by the OAuth provider oogle Cloud .
    /// This uniquely identifies your application during the authentication process.
    /// </summary>
    public string ClientID { get; set; } = string.Empty;

    /// <summary>
    /// This secret is used together with the Client ID to securely authenticate your 
    /// application when obtaining access tokens for Google Workspace APIs.
    /// </summary>
    public string ClientSecret { get; set; } = string.Empty;
}

// <summary>
/// Represents the credentials required to authenticate requests to the Azure Open AI.
/// </summary>
public class AzureOpenAiCredentialsDto
{
    /// <summary>
    /// Gets or sets the API key used for authenticating requests to the Azure OpenAI service.
    /// This key is required for authentication when making requests to the service.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the resource name that identifies the Azure OpenAI resource.
    /// This value is typically found in the Azure portal and helps to associate the request with a specific resource.
    /// </summary>
    public string ResourceName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API version to be used in the requests.
    /// The version specifies which version of the API to use and is required for compatibility.
    /// </summary>
    public string APIVersion { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the endpoint URL for the Azure OpenAI service.
    /// This is the base URL for making requests to the service and typically includes the region information.
    /// </summary>
    public string Endpoint { get; set; } = string.Empty;
}

/// <summary>
/// Represents the credentials and configuration required to authenticate requests
/// to the ElevenLabs API.
/// </summary>
public class ElevenLabsCredentialsDto
{
    /// <summary>
    /// Gets or sets the base URL or host address for the ElevenLabs API.
    /// </summary>
    public string Host { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API key used for authenticating requests to the ElevenLabs API.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>
/// Represents the credentials and configuration required to authenticate requests
/// to the OpenRouter API.
/// </summary>
public class OpenRouterCredentialsDto
{
    /// <summary>
    /// Gets or sets the API key used for authenticating requests to the OpenRouter API.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>
/// Represents the necessary credentials and configuration for authenticating
/// requests to Azure Storage services.
/// </summary>
public class AzureStorageCredentialsDto
{
    /// <summary>
    /// Gets or sets the account name used to authenticate requests to Azure Storage.
    /// </summary>
    public string Account { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the account key used to authenticate requests to Azure Storage.
    /// </summary>
    public string Key { get; set; } = string.Empty;
}

public class AzureBolbStorageCredentialsDto
{
    /// <summary>
    /// Gets or sets the ConnectionString.
    /// </summary>
    public string ConnectionString { get; set; } = string.Empty;
}

/// <summary>
/// Represents credentials containing a database connection string.
/// </summary>
public class ConnectionStringCredentialsDto
{
    /// <summary>
    /// The connection string used to connect to a data source.
    /// </summary>
    public string ConnectionString { get; set; } = string.Empty;
}

public class QdrantCredentialsDto
{
    /// <summary>
    /// Gets or sets the base URL of the Qdrant service.
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API key used for Qdrant authentication (optional).
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}