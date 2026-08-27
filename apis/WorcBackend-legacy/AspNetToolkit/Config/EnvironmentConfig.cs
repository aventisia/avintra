namespace AspNetToolkit.Config;

public class EnvironmentConfig
{
    // Required Tenant and Instance data
    public string AppBaseUrl { get; set; } = string.Empty;
    public string OnPremTenantId { get; set; } = string.Empty;
    public string OnPremInstanceKey { get; set; } = string.Empty;
    public string OnPremAdminEmail { get; set; } = string.Empty;

    // Tenant and Instance data fetched from Global Admin Service
    public string OnPremTenantType { get; set; } = string.Empty;
    public string OnPremTenantName { get; set; } = string.Empty;
    public string OnPremInstanceType { get; set; } = string.Empty;
    public DateTime OnPremContractStart { get; set; } = DateTime.MinValue;
    public DateTime OnPremContractEnd { get; set; } = DateTime.MinValue;
    public double OnPremExecutionTimeAllowed { get; set; }
    public bool OnPremExecutionDisabled { get; set; }
    public bool OnPremLoginDisabled { get; set; }

    // Database and Storage
    public string PostgresqlHost { get; set; } = string.Empty;
    public int PostgresqlPort { get; set; }
    public string PostgresqlUsername { get; set; } = string.Empty;
    public string PostgresqlPassword { get; set; } = string.Empty;
    public string AzureBlobStorageConnectionString { get; set; } = string.Empty;

    // Azure Entra ID
    public bool AzureEntraIdEnabled { get; set; }
    public string AzureTenantId { get; set; } = string.Empty;
    public string AzureEntraIdClientId { get; set; } = string.Empty;
    public string AzureEntraIdClientSecret { get; set; } = string.Empty;

    // JWT
    public string JwtSecretKey { get; set; } = string.Empty;
    public int JwtValidityInMinutes { get; set; }
    public int JwtRefreshTokenValidityInDays { get; set; }

    // SMTP
    public string SmtpHost { get; set; } = string.Empty;
    public int SmtpPort { get; set; }
    public string SmtpUser { get; set; } = string.Empty;
    public string SmtpPassword { get; set; } = string.Empty;
    public string SmtpMailFromName { get; set; } = string.Empty;
    public string SmtpMailFromAddress { get; set; } = string.Empty;

    // Encryption
    public string AesEncryptionKey { get; set; } = string.Empty;
    public string AesInitializationVector { get; set; } = string.Empty;

    // Payment Gateway
    public bool RazorpayEnabled { get; set; }
    public string RazorpayKeyId { get; set; } = string.Empty;
    public string RazorpayKeySecret { get; set; } = string.Empty;
    public string RazorpayWebhookSecret { get; set; } = string.Empty;

    // AI API Keys
    public string OpenAiApiKey { get; set; } = string.Empty;
    public string DeepInfraApiKey { get; set; } = string.Empty;
    public string GeminiApiKey { get; set; } = string.Empty;
    public string OpenRouterApiKey { get; set; } = string.Empty;

    // Internal Service URLs
    public string AccountsApiBaseUrl { get; set; } = string.Empty;
    public string WorkspaceApiBaseUrl { get; set; } = string.Empty;
    public string LlmPipelineApiBaseUrl { get; set; } = string.Empty;
    public string CorsairSidecarUrl { get; set; } = string.Empty;
    public string CorsairApiKey { get; set; } = string.Empty;
    public string CorsairRedirectUri { get; set; } = string.Empty;

    // Apache Camel connector harness (internal)
    public string CamelApiBaseUrl { get; set; } = string.Empty;

    // Sales emails
    public string SalesEmails { get; set; } = string.Empty;

    // Identity Configurations
    public int MaxActiveSessionAllowed { get; set; }
    public int ObsoletePwdRetainLimit { get; set; }
    public int DefaultLockoutTimeSpanInMinutes { get; set; }
    public int LockoutMaxFailedAccessAttempts { get; set; }

    // OTP Configs
    public int OtpValidityInMinutes { get; set; }
    public int OtpNumberOfCharacters { get; set; }
    public bool OtpIsAlphaNumeric { get; set; }

    // Cors Origins
    public string CorsOrigins { get; set; } = string.Empty;

    // Custom API Key Config
    public string CustomApiKey { get; set; } = string.Empty;
}