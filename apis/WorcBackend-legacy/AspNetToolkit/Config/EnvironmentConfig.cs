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

    // Single sign-on
    public bool MicrosoftSsoEnabled { get; set; }

    /// <summary>
    /// Single sign-on allowed by GlobalAdmin for this deployment.
    /// </summary>
    public bool SsoAllowed { get; set; }

    /// <summary>
    /// Deployment branding allowed by GlobalAdmin for this deployment.
    /// </summary>
    public bool BrandingAllowed { get; set; }

    /// <summary>
    /// Microsoft Entra client id used by the single sign-on flow.
    /// </summary>
    public string MicrosoftSsoClientId { get; set; } = string.Empty;

    /// <summary>
    /// Microsoft Entra client secret used by the single sign-on flow.
    /// </summary>
    public string MicrosoftSsoClientSecret { get; set; } = string.Empty;

    /// <summary>
    /// Google client id reserved for the single sign-on flow.
    /// </summary>
    public string GoogleSsoClientId { get; set; } = string.Empty;

    /// <summary>
    /// Google client secret reserved for the single sign-on flow.
    /// </summary>
    public string GoogleSsoClientSecret { get; set; } = string.Empty;

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
    public string CorsairApiBaseUrl { get; set; } = string.Empty;
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

    // Deployment branding (self-hosted white-label). All values are optional; any value left
    // unset falls back to the built-in Avintra/Aventisia defaults on the client.
    public string? BrandingAppName { get; set; }
    public string? BrandingCompanyName { get; set; }
    public string? BrandingCompanyLogoUrlLight { get; set; }
    public string? BrandingCompanyLogoUrlDark { get; set; }
    public string? BrandingProductLogoUrlLight { get; set; }
    public string? BrandingProductLogoUrlDark { get; set; }
    public string? BrandingShortLogoUrlLight { get; set; }
    public string? BrandingShortLogoUrlDark { get; set; }
    public string? BrandingFaviconUrlLight { get; set; }
    public string? BrandingFaviconUrlDark { get; set; }
    public string? BrandingBackgroundColor { get; set; }
    public string? BrandingForegroundColor { get; set; }
    public string? BrandingPrimaryColor { get; set; }
    public string? BrandingPrimaryForegroundColor { get; set; }
    public string? BrandingSecondaryColor { get; set; }
    public string? BrandingSecondaryForegroundColor { get; set; }
    public string? BrandingAccentColor { get; set; }
    public string? BrandingAccentForegroundColor { get; set; }

    /// <summary>
    /// True when the deployment runs as the explicit Community edition. Startup configuration
    /// refuses to start on ambiguous identity settings (exactly one of the tenant id / instance
    /// key present) and on both blank unless <c>ON_PREM_EDITION=Community</c> is set.
    /// </summary>
    public bool IsCommunityDeployment =>
        string.IsNullOrWhiteSpace(OnPremTenantId) || string.IsNullOrWhiteSpace(OnPremInstanceKey);

    /// <summary>
    /// True when single sign-on may be offered for this deployment.
    /// </summary>
    public bool IsSsoAllowedForDeployment => !IsCommunityDeployment && SsoAllowed;

    /// <summary>
    /// True when deployment branding may be applied for this deployment.
    /// </summary>
    public bool IsBrandingAllowedForDeployment => !IsCommunityDeployment && BrandingAllowed;
}