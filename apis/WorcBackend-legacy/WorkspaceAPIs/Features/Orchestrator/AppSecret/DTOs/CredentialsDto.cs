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
    /// Gets or sets the base URL of the GitHub API. Defaults to "https://api.github.com".
    /// </summary>
    public string Url { get; set; } = "https://api.github.com";

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
    /// Gets or sets the base URL of the Anthropic service.
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API key used for Anthropic authentication (optional).
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>
/// Represents the credentials required to connect to a self-hosted Ollama server.
/// </summary>
public class OllamaCredentialsDto
{
    /// <summary>
    /// Gets or sets the base URL of the Ollama server.
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API key used for Ollama authentication (optional).
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>
/// Represents the credentials required to connect to Ollama Cloud.
/// The base URL is static (https://ollama.com/v1).
/// </summary>
public class OllamaCloudCredentialsDto
{
    /// <summary>
    /// Gets or sets the base URL of the Ollama Cloud service.
    /// </summary>
    public string Url { get; set; } = "https://ollama.com/v1";

    /// <summary>
    /// Gets or sets the API key used for Ollama Cloud authentication.
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

/// <summary>
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

/// <summary>
/// Represents credentials for a custom API tool.
/// </summary>
public class CustomApiToolCredentialsDto
{
    /// <summary>
    /// Authentication type.
    /// </summary>
    public ToolAuthenticationTypeEnum Type { get; set; }

    /// <summary>
    /// Authentication parameters.
    /// </summary>
    public Dictionary<string, string> Parameters { get; set; } = [];
}

#region -------------------- GroqCredentialsDto --------------------

/// <summary>
/// Represents the credentials and configuration required to authenticate requests to the Groq API.
/// </summary>
public class GroqCredentialsDto
{
    /// <summary>
    /// Gets or sets the base URL of the Groq API.
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API key used for authenticating requests to the Groq API.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}
#endregion

#region -------------------- BedrockCredentialsDto --------------------

/// <summary>
/// Contains the AWS access credentials required to authenticate requests to the Amazon Bedrock API.
/// </summary>
public class BedrockCredentialsDto
{
    /// <summary>
    /// Gets or sets the AWS region to be used (e.g., "us-east-1").
    /// </summary>
    public string Region { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the AWS access key ID used for authentication.
    /// </summary>
    public string AccessKeyId { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the AWS secret access key used for authentication.
    /// </summary>
    public string SecretAccessKey { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the session token used with temporary credentials (optional).
    /// </summary>
    public string SessionToken { get; set; } = string.Empty;
}
#endregion

#region -------------------- MistralCredentialsDto --------------------

/// <summary>
/// Represents the credentials and configuration required to authenticate requests to the Mistral AI API.
/// </summary>
public class MistralCredentialsDto
{
    /// <summary>
    /// Gets or sets the base URL of the Mistral AI API.
    /// </summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the API key used for authenticating requests to the Mistral AI API.
    /// </summary>
    public string ApiKey { get; set; } = string.Empty;
}
#endregion

// >>> LiteLLMProviderDtos:START <<<
// <auto-generated>
// Generated by LiteLLMProviders/Codegen/generate_providers.py — DO NOT EDIT.
// Add a provider to the registry and re-run the script.
// </auto-generated>

// One typed DTO per individual LiteLLM provider type (except the reused
// OpenAI/Anthropic/Gemini/Groq/Bedrock/Mistral/OpenRouter/ElevenLabs/Ollama
// types that already have dedicated DTOs).

/// <summary>Credentials for the 'a2a' provider.</summary>
public class A2aCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'a2a_agent' provider.</summary>
public class A2aAgentCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'ai21' provider.</summary>
public class Ai21CredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'ai21_chat' provider.</summary>
public class Ai21ChatCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'aiml' provider.</summary>
public class AimlCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'aiohttp_openai' provider.</summary>
public class AiohttpOpenaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'amazon_nova' provider.</summary>
public class AmazonNovaCredentialsDto
{
    /// <summary>Gets or sets the region.</summary>
    public string Region { get; set; } = "us-east-1";
    /// <summary>Gets or sets the access key id.</summary>
    public string AccessKeyId { get; set; } = string.Empty;
    /// <summary>Gets or sets the secret access key.</summary>
    public string SecretAccessKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the session token.</summary>
    public string SessionToken { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'anthropic_text' provider.</summary>
public class AnthropicTextCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'apertis' provider.</summary>
public class ApertisCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'assemblyai' provider.</summary>
public class AssemblyaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'auto_router' provider.</summary>
public class AutoRouterCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'aws_polly' provider.</summary>
public class AwsPollyCredentialsDto
{
    /// <summary>Gets or sets the region.</summary>
    public string Region { get; set; } = "us-east-1";
    /// <summary>Gets or sets the access key id.</summary>
    public string AccessKeyId { get; set; } = string.Empty;
    /// <summary>Gets or sets the secret access key.</summary>
    public string SecretAccessKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the session token.</summary>
    public string SessionToken { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'azure' provider.</summary>
public class AzureCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the resource name.</summary>
    public string ResourceName { get; set; } = string.Empty;
    /// <summary>Gets or sets the api version.</summary>
    public string ApiVersion { get; set; } = "2024-06-01";
    /// <summary>Gets or sets the endpoint.</summary>
    public string Endpoint { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'azure_ai' provider.</summary>
public class AzureAiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the resource name.</summary>
    public string ResourceName { get; set; } = string.Empty;
    /// <summary>Gets or sets the api version.</summary>
    public string ApiVersion { get; set; } = "2024-06-01";
    /// <summary>Gets or sets the endpoint.</summary>
    public string Endpoint { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'azure_text' provider.</summary>
public class AzureTextCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the resource name.</summary>
    public string ResourceName { get; set; } = string.Empty;
    /// <summary>Gets or sets the api version.</summary>
    public string ApiVersion { get; set; } = "2024-06-01";
    /// <summary>Gets or sets the endpoint.</summary>
    public string Endpoint { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'baseten' provider.</summary>
public class BasetenCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'bedrock_mantle' provider.</summary>
public class BedrockMantleCredentialsDto
{
    /// <summary>Gets or sets the region.</summary>
    public string Region { get; set; } = "us-east-1";
    /// <summary>Gets or sets the access key id.</summary>
    public string AccessKeyId { get; set; } = string.Empty;
    /// <summary>Gets or sets the secret access key.</summary>
    public string SecretAccessKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the session token.</summary>
    public string SessionToken { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'black_forest_labs' provider.</summary>
public class BlackForestLabsCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'bytez' provider.</summary>
public class BytezCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'cerebras' provider.</summary>
public class CerebrasCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'charity_engine' provider.</summary>
public class CharityEngineCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'chatgpt' provider.</summary>
public class ChatgptCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'chutes' provider.</summary>
public class ChutesCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'clarifai' provider.</summary>
public class ClarifaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'cloudflare' provider.</summary>
public class CloudflareCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'codestral' provider.</summary>
public class CodestralCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'cohere' provider.</summary>
public class CohereCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'cohere_chat' provider.</summary>
public class CohereChatCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'cometapi' provider.</summary>
public class CometapiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'compactifai' provider.</summary>
public class CompactifaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'cursor' provider.</summary>
public class CursorCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'custom' provider.</summary>
public class CustomCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'custom_openai' provider.</summary>
public class CustomOpenaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'darkbloom' provider.</summary>
public class DarkbloomCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'dashscope' provider.</summary>
public class DashscopeCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'databricks' provider.</summary>
public class DatabricksCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'datarobot' provider.</summary>
public class DatarobotCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'deepgram' provider.</summary>
public class DeepgramCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'deepinfra' provider.</summary>
public class DeepinfraCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'deepseek' provider.</summary>
public class DeepseekCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'docker_model_runner' provider.</summary>
public class DockerModelRunnerCredentialsDto
{
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'dotprompt' provider.</summary>
public class DotpromptCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'empower' provider.</summary>
public class EmpowerCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'fal_ai' provider.</summary>
public class FalAiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'featherless_ai' provider.</summary>
public class FeatherlessAiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'fireworks_ai' provider.</summary>
public class FireworksAiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'friendliai' provider.</summary>
public class FriendliaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'galadriel' provider.</summary>
public class GaladrielCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'gdc' provider.</summary>
public class GdcCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'gigachat' provider.</summary>
public class GigachatCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'github_copilot' provider.</summary>
public class GithubCopilotCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'gradient_ai' provider.</summary>
public class GradientAiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'helicone' provider.</summary>
public class HeliconeCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'heroku' provider.</summary>
public class HerokuCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'hosted_vllm' provider.</summary>
public class HostedVllmCredentialsDto
{
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'huggingface' provider.</summary>
public class HuggingfaceCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'humanloop' provider.</summary>
public class HumanloopCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'hyperbolic' provider.</summary>
public class HyperbolicCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'inception' provider.</summary>
public class InceptionCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'infinity' provider.</summary>
public class InfinityCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'jina_ai' provider.</summary>
public class JinaAiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'lambda_ai' provider.</summary>
public class LambdaAiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'langflow' provider.</summary>
public class LangflowCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'langfuse' provider.</summary>
public class LangfuseCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'langgraph' provider.</summary>
public class LanggraphCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'lemonade' provider.</summary>
public class LemonadeCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'libertai' provider.</summary>
public class LibertaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'litellm_agent' provider.</summary>
public class LitellmAgentCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'litellm_proxy' provider.</summary>
public class LitellmProxyCredentialsDto
{
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'llamafile' provider.</summary>
public class LlamafileCredentialsDto
{
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'lm_studio' provider.</summary>
public class LmStudioCredentialsDto
{
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'manus' provider.</summary>
public class ManusCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'maritalk' provider.</summary>
public class MaritalkCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'meta' provider.</summary>
public class MetaCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'meta_llama' provider.</summary>
public class MetaLlamaCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'milvus' provider.</summary>
public class MilvusCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'minimax' provider.</summary>
public class MinimaxCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'modelscope' provider.</summary>
public class ModelscopeCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'moonshot' provider.</summary>
public class MoonshotCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'morph' provider.</summary>
public class MorphCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'nano-gpt' provider.</summary>
public class NanoGptCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'nebius' provider.</summary>
public class NebiusCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'neosantara' provider.</summary>
public class NeosantaraCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'nlp_cloud' provider.</summary>
public class NlpCloudCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'novita' provider.</summary>
public class NovitaCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'nscale' provider.</summary>
public class NscaleCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'nvidia_nim' provider.</summary>
public class NvidiaNimCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'nvidia_riva' provider.</summary>
public class NvidiaRivaCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'oci' provider.</summary>
public class OciCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'ollama_chat' provider.</summary>
public class OllamaChatCredentialsDto
{
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'oobabooga' provider.</summary>
public class OobaboogaCredentialsDto
{
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'openai_like' provider.</summary>
public class OpenaiLikeCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'ovhcloud' provider.</summary>
public class OvhcloudCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'parasail' provider.</summary>
public class ParasailCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'perplexity' provider.</summary>
public class PerplexityCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'petals' provider.</summary>
public class PetalsCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'pg_vector' provider.</summary>
public class PgVectorCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'pinstripes' provider.</summary>
public class PinstripesCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'poe' provider.</summary>
public class PoeCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'predibase' provider.</summary>
public class PredibaseCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'publicai' provider.</summary>
public class PublicaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'ragflow' provider.</summary>
public class RagflowCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'recraft' provider.</summary>
public class RecraftCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'reducto' provider.</summary>
public class ReductoCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'replicate' provider.</summary>
public class ReplicateCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'runwayml' provider.</summary>
public class RunwaymlCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 's3_vectors' provider.</summary>
public class S3VectorsCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'sagemaker' provider.</summary>
public class SagemakerCredentialsDto
{
    /// <summary>Gets or sets the region.</summary>
    public string Region { get; set; } = "us-east-1";
    /// <summary>Gets or sets the access key id.</summary>
    public string AccessKeyId { get; set; } = string.Empty;
    /// <summary>Gets or sets the secret access key.</summary>
    public string SecretAccessKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the session token.</summary>
    public string SessionToken { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'sagemaker_chat' provider.</summary>
public class SagemakerChatCredentialsDto
{
    /// <summary>Gets or sets the region.</summary>
    public string Region { get; set; } = "us-east-1";
    /// <summary>Gets or sets the access key id.</summary>
    public string AccessKeyId { get; set; } = string.Empty;
    /// <summary>Gets or sets the secret access key.</summary>
    public string SecretAccessKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the session token.</summary>
    public string SessionToken { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'sagemaker_nova' provider.</summary>
public class SagemakerNovaCredentialsDto
{
    /// <summary>Gets or sets the region.</summary>
    public string Region { get; set; } = "us-east-1";
    /// <summary>Gets or sets the access key id.</summary>
    public string AccessKeyId { get; set; } = string.Empty;
    /// <summary>Gets or sets the secret access key.</summary>
    public string SecretAccessKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the session token.</summary>
    public string SessionToken { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'sambanova' provider.</summary>
public class SambanovaCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'sap' provider.</summary>
public class SapCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'scaleway' provider.</summary>
public class ScalewayCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'snowflake' provider.</summary>
public class SnowflakeCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'soniox' provider.</summary>
public class SonioxCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'stability' provider.</summary>
public class StabilityCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'synthetic' provider.</summary>
public class SyntheticCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'tencent' provider.</summary>
public class TencentCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'tensormesh' provider.</summary>
public class TensormeshCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'text-completion-codestral' provider.</summary>
public class TextCompletionCodestralCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'text-completion-inception' provider.</summary>
public class TextCompletionInceptionCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'text-completion-openai' provider.</summary>
public class TextCompletionOpenaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'together_ai' provider.</summary>
public class TogetherAiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'topaz' provider.</summary>
public class TopazCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'triton' provider.</summary>
public class TritonCredentialsDto
{
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'v0' provider.</summary>
public class V0CredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'vercel_ai_gateway' provider.</summary>
public class VercelAiGatewayCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'vertex_ai' provider.</summary>
public class VertexAiCredentialsDto
{
    /// <summary>Gets or sets the project id.</summary>
    public string ProjectId { get; set; } = string.Empty;
    /// <summary>Gets or sets the location.</summary>
    public string Location { get; set; } = "us-central1";
    /// <summary>Gets or sets the service account json.</summary>
    public string ServiceAccountJson { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'vertex_ai_beta' provider.</summary>
public class VertexAiBetaCredentialsDto
{
    /// <summary>Gets or sets the project id.</summary>
    public string ProjectId { get; set; } = string.Empty;
    /// <summary>Gets or sets the location.</summary>
    public string Location { get; set; } = "us-central1";
    /// <summary>Gets or sets the service account json.</summary>
    public string ServiceAccountJson { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'vllm' provider.</summary>
public class VllmCredentialsDto
{
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'volcengine' provider.</summary>
public class VolcengineCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'voyage' provider.</summary>
public class VoyageCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'wandb' provider.</summary>
public class WandbCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'watsonx' provider.</summary>
public class WatsonxCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the project id.</summary>
    public string ProjectId { get; set; } = string.Empty;
    /// <summary>Gets or sets the region.</summary>
    public string Region { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'watsonx_text' provider.</summary>
public class WatsonxTextCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
    /// <summary>Gets or sets the project id.</summary>
    public string ProjectId { get; set; } = string.Empty;
    /// <summary>Gets or sets the region.</summary>
    public string Region { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'xai' provider.</summary>
public class XaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'xiaomi_mimo' provider.</summary>
public class XiaomiMimoCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'xinference' provider.</summary>
public class XinferenceCredentialsDto
{
    /// <summary>Gets or sets the base url.</summary>
    public string Url { get; set; } = string.Empty;
}

/// <summary>Credentials for the 'zai' provider.</summary>
public class ZaiCredentialsDto
{
    /// <summary>Gets or sets the api key.</summary>
    public string ApiKey { get; set; } = string.Empty;
}
// >>> LiteLLMProviderDtos:END <<<