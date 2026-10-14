namespace AspNetToolkit.Extensions;

public static class EnvironmentConfigurationExtension
{
    // Maximum length accepted for branding text values (app/company name).
    private const int BrandingNameMaxLength = 100;

    // Accepted CSS color formats for branding. Each channel must be a number so a malformed value
    // (e.g. "rgb(,,,)") cannot be served and silently reset the client theme.
    private static readonly Regex BrandingHexColorRegex = new(
        @"^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$",
        RegexOptions.Compiled);

    private static readonly Regex BrandingRgbColorRegex = new(
        @"^rgba?\(\s*[0-9.]+%?\s*[,\s]\s*[0-9.]+%?\s*[,\s]\s*[0-9.]+%?\s*(?:[,/]\s*[0-9.]+%?\s*)?\)$",
        RegexOptions.Compiled);

    private static readonly Regex BrandingHslColorRegex = new(
        @"^hsla?\(\s*[0-9.]+(?:deg|grad|rad|turn)?\s*[,\s]\s*[0-9.]+%?\s*[,\s]\s*[0-9.]+%?\s*(?:[,/]\s*[0-9.]+%?\s*)?\)$",
        RegexOptions.Compiled);

    /// <summary>
    /// Loads sensitive configuration from environment variables and merges with existing configuration
    /// </summary>
    public static IConfigurationRoot LoadEnvironmentConfiguration(
        this IConfigurationRoot config,
        bool isLocalhostEnvironment
    )
    {
        // Load .env.local file if it exists (for local development)
        if (isLocalhostEnvironment)
        {
            var envLocalPath = Path.Combine(Directory.GetCurrentDirectory(), ".env.local");
            if (File.Exists(envLocalPath))
            {
                DotNetEnv.Env.Load(envLocalPath);
            }
        }

        // Basic environment variables
        var APP_BASE_URL = GetRequiredEnvVar("APP_BASE_URL");

        // On-prem tenant credentials are optional: either being blank marks the deployment as
        // community. The admin email is always required so the default platform user can be seeded.
        var ON_PREM_TENANT_ID = Environment.GetEnvironmentVariable("ON_PREM_TENANT_ID") ?? string.Empty;
        var ON_PREM_INSTANCE_KEY = Environment.GetEnvironmentVariable("ON_PREM_INSTANCE_KEY") ?? string.Empty;
        var ON_PREM_ADMIN_EMAIL = GetRequiredEnvVar("ON_PREM_ADMIN_EMAIL");

        // Community deployments never synchronize with GlobalAdmin. This rule mirrors
        // EnvironmentConfig.IsCommunityDeployment so the decision is made once here.
        var isCommunityDeployment = string.IsNullOrWhiteSpace(ON_PREM_TENANT_ID)
            || string.IsNullOrWhiteSpace(ON_PREM_INSTANCE_KEY);

        // Database and storage environment variables
        var POSTGRESQL_HOST = GetRequiredEnvVar("POSTGRESQL_HOST");
        var POSTGRESQL_PORT = Environment.GetEnvironmentVariable("POSTGRESQL_PORT") ?? config["EnvironmentConfig:PostgresqlPort"] ?? "5432";
        var POSTGRESQL_USERNAME = GetRequiredEnvVar("POSTGRESQL_USERNAME");
        var POSTGRESQL_PASSWORD = GetRequiredEnvVar("POSTGRESQL_PASSWORD");
        var AZURE_BLOB_STORAGE_CONNECTION_STRING = GetRequiredEnvVar("AZURE_BLOB_STORAGE_CONNECTION_STRING");

        // JWT environment variables
        var JWT_SECRET_KEY = GetRequiredEnvVar("JWT_SECRET_KEY");
        var JWT_VALIDITY_IN_MINUTES = Environment.GetEnvironmentVariable("JWT_VALIDITY_IN_MINUTES") ?? config["EnvironmentConfig:JwtValidityInMinutes"] ?? "60";
        var JWT_REFRESH_TOKEN_VALIDITY_IN_DAYS = Environment.GetEnvironmentVariable("JWT_REFRESH_TOKEN_VALIDITY_IN_DAYS") ?? config["EnvironmentConfig:JwtRefreshTokenValidityInDays"] ?? "30";

        // Encryption environment variables
        var AES_ENCRYPTION_KEY = GetRequiredEnvVar("AES_ENCRYPTION_KEY");
        var AES_INITIALIZATION_VECTOR = GetRequiredEnvVar("AES_INITIALIZATION_VECTOR");

        // Azure Entra ID environment variables
        var AZURE_ENTRA_ID_ENABLED = bool.Parse(Environment.GetEnvironmentVariable("AZURE_ENTRA_ID_ENABLED") ?? config["EnvironmentConfig:AzureEntraIdEnabled"] ?? "false");
        string AZURE_TENANT_ID = string.Empty;
        string AZURE_ENTRA_ID_CLIENT_ID = string.Empty;
        string AZURE_ENTRA_ID_CLIENT_SECRET = string.Empty;
        if (AZURE_ENTRA_ID_ENABLED)
        {
            AZURE_TENANT_ID = GetRequiredEnvVar("AZURE_TENANT_ID");
            AZURE_ENTRA_ID_CLIENT_ID = GetRequiredEnvVar("AZURE_ENTRA_ID_CLIENT_ID");
            AZURE_ENTRA_ID_CLIENT_SECRET = Environment.GetEnvironmentVariable("AZURE_ENTRA_ID_CLIENT_SECRET") ?? string.Empty;
        }

        // SMTP environment variables
        var SMTP_HOST = Environment.GetEnvironmentVariable("SMTP_HOST") ?? string.Empty;
        var SMTP_PORT = Environment.GetEnvironmentVariable("SMTP_PORT") ?? "0";
        var SMTP_USER = Environment.GetEnvironmentVariable("SMTP_USER") ?? string.Empty;
        var SMTP_PASSWORD = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? string.Empty;
        var SMTP_MAIL_FROM_NAME = Environment.GetEnvironmentVariable("SMTP_MAIL_FROM_NAME") ?? string.Empty;
        var SMTP_MAIL_FROM_ADDRESS = Environment.GetEnvironmentVariable("SMTP_MAIL_FROM_ADDRESS") ?? string.Empty;

        // LLM and AI service environment variables
        var OPENAI_API_KEY = Environment.GetEnvironmentVariable("OPENAI_API_KEY") ?? string.Empty;
        var DEEPINFRA_API_KEY = Environment.GetEnvironmentVariable("DEEPINFRA_API_KEY") ?? string.Empty;
        var GEMINI_API_KEY = Environment.GetEnvironmentVariable("GEMINI_API_KEY") ?? string.Empty;
        var OPENROUTER_API_KEY = Environment.GetEnvironmentVariable("OPENROUTER_API_KEY") ?? string.Empty;

        var CUSTOM_API_KEY = Environment.GetEnvironmentVariable("CUSTOM_API_KEY") ?? string.Empty;

        // Deployment branding (self-hosted white-label). All values are optional; any value left
        // unset falls back to the built-in Avintra/Aventisia defaults on the client. Invalid
        // colors/URLs/oversized text are dropped with a warning so a bad value cannot break the UI.
        var BRANDING_APP_NAME = NormalizeOptional("BRANDING_APP_NAME", Environment.GetEnvironmentVariable("BRANDING_APP_NAME"), BrandingNameMaxLength);
        var BRANDING_COMPANY_NAME = NormalizeOptional("BRANDING_COMPANY_NAME", Environment.GetEnvironmentVariable("BRANDING_COMPANY_NAME"), BrandingNameMaxLength);
        var BRANDING_COMPANY_LOGO_URL_LIGHT = SanitizeBrandingUrl("BRANDING_COMPANY_LOGO_URL_LIGHT", Environment.GetEnvironmentVariable("BRANDING_COMPANY_LOGO_URL_LIGHT"), APP_BASE_URL);
        var BRANDING_COMPANY_LOGO_URL_DARK = SanitizeBrandingUrl("BRANDING_COMPANY_LOGO_URL_DARK", Environment.GetEnvironmentVariable("BRANDING_COMPANY_LOGO_URL_DARK"), APP_BASE_URL);
        var BRANDING_PRODUCT_LOGO_URL_LIGHT = SanitizeBrandingUrl("BRANDING_PRODUCT_LOGO_URL_LIGHT", Environment.GetEnvironmentVariable("BRANDING_PRODUCT_LOGO_URL_LIGHT"), APP_BASE_URL);
        var BRANDING_PRODUCT_LOGO_URL_DARK = SanitizeBrandingUrl("BRANDING_PRODUCT_LOGO_URL_DARK", Environment.GetEnvironmentVariable("BRANDING_PRODUCT_LOGO_URL_DARK"), APP_BASE_URL);
        var BRANDING_SHORT_LOGO_URL_LIGHT = SanitizeBrandingUrl("BRANDING_SHORT_LOGO_URL_LIGHT", Environment.GetEnvironmentVariable("BRANDING_SHORT_LOGO_URL_LIGHT"), APP_BASE_URL);
        var BRANDING_SHORT_LOGO_URL_DARK = SanitizeBrandingUrl("BRANDING_SHORT_LOGO_URL_DARK", Environment.GetEnvironmentVariable("BRANDING_SHORT_LOGO_URL_DARK"), APP_BASE_URL);
        var BRANDING_FAVICON_URL_LIGHT = SanitizeBrandingUrl("BRANDING_FAVICON_URL_LIGHT", Environment.GetEnvironmentVariable("BRANDING_FAVICON_URL_LIGHT"), APP_BASE_URL);
        var BRANDING_FAVICON_URL_DARK = SanitizeBrandingUrl("BRANDING_FAVICON_URL_DARK", Environment.GetEnvironmentVariable("BRANDING_FAVICON_URL_DARK"), APP_BASE_URL);
        var BRANDING_BACKGROUND_COLOR = SanitizeBrandingColor("BRANDING_BACKGROUND_COLOR", Environment.GetEnvironmentVariable("BRANDING_BACKGROUND_COLOR"));
        var BRANDING_FOREGROUND_COLOR = SanitizeBrandingColor("BRANDING_FOREGROUND_COLOR", Environment.GetEnvironmentVariable("BRANDING_FOREGROUND_COLOR"));
        var BRANDING_PRIMARY_COLOR = SanitizeBrandingColor("BRANDING_PRIMARY_COLOR", Environment.GetEnvironmentVariable("BRANDING_PRIMARY_COLOR"));
        var BRANDING_PRIMARY_FOREGROUND_COLOR = SanitizeBrandingColor("BRANDING_PRIMARY_FOREGROUND_COLOR", Environment.GetEnvironmentVariable("BRANDING_PRIMARY_FOREGROUND_COLOR"));
        var BRANDING_SECONDARY_COLOR = SanitizeBrandingColor("BRANDING_SECONDARY_COLOR", Environment.GetEnvironmentVariable("BRANDING_SECONDARY_COLOR"));
        var BRANDING_SECONDARY_FOREGROUND_COLOR = SanitizeBrandingColor("BRANDING_SECONDARY_FOREGROUND_COLOR", Environment.GetEnvironmentVariable("BRANDING_SECONDARY_FOREGROUND_COLOR"));
        var BRANDING_ACCENT_COLOR = SanitizeBrandingColor("BRANDING_ACCENT_COLOR", Environment.GetEnvironmentVariable("BRANDING_ACCENT_COLOR"));
        var BRANDING_ACCENT_FOREGROUND_COLOR = SanitizeBrandingColor("BRANDING_ACCENT_FOREGROUND_COLOR", Environment.GetEnvironmentVariable("BRANDING_ACCENT_FOREGROUND_COLOR"));

        // Internal service URLs environment variables
        var ACCOUNTS_API_BASE_URL = Environment.GetEnvironmentVariable("ACCOUNTS_API_BASE_URL") ?? config["EnvironmentConfig:AccountsApiBaseUrl"] ?? "http://accounts-apis:4000";
        var WORKSPACE_API_BASE_URL = Environment.GetEnvironmentVariable("WORKSPACE_API_BASE_URL") ?? config["EnvironmentConfig:WorkspaceApiBaseUrl"] ?? "http://workspace-apis:4001";
        var LLMPIPELINE_API_BASE_URL = Environment.GetEnvironmentVariable("LLMPIPELINE_API_BASE_URL") ?? config["EnvironmentConfig:LlmPipelineApiBaseUrl"] ?? "http://llmpipeline-apis:4003";
        var CAMEL_API_BASE_URL = Environment.GetEnvironmentVariable("CAMEL_API_BASE_URL") ?? config["EnvironmentConfig:CamelApiBaseUrl"] ?? "http://camel-connector-harness:4005";
        var CORSAIR_API_BASE_URL = Environment.GetEnvironmentVariable("CORSAIR_API_BASE_URL") ?? config["EnvironmentConfig:CorsairApiBaseUrl"] ?? "http://corsair:4006";
        // Public OAuth redirect URI must use the generic "integration" proxy path so end users
        // never see the internal "corsair" service name in browser URLs.
        var configuredCorsairRedirectUri = Environment.GetEnvironmentVariable("CORSAIR_REDIRECT_URI") ?? config["EnvironmentConfig:CorsairRedirectUri"];
        var CORSAIR_REDIRECT_URI = configuredCorsairRedirectUri ?? $"https://{APP_BASE_URL}/workspace/api/integration/oauth-callback";
        if (!isLocalhostEnvironment && string.IsNullOrWhiteSpace(configuredCorsairRedirectUri))
        {
            Console.Error.WriteLine("CORSAIR_REDIRECT_URI is not configured; using the local development OAuth callback.");
        }

        // Sales and support emails environment variable
        var SALES_EMAILS = Environment.GetEnvironmentVariable("SALES_EMAILS") ?? config["EnvironmentConfig:SalesEmails"] ?? string.Empty;

        // Identity and security settings environment variables
        var MAX_ACTIVE_SESSION_ALLOWED = Environment.GetEnvironmentVariable("MAX_ACTIVE_SESSION_ALLOWED") ?? config["EnvironmentConfig:MaxActiveSessionAllowed"] ?? "50";
        var OBSOLETE_PWD_RETAIN_LIMIT = Environment.GetEnvironmentVariable("OBSOLETE_PWD_RETAIN_LIMIT") ?? config["EnvironmentConfig:ObsoletePwdRetainLimit"] ?? "5";
        var DEFAULT_LOCKOUT_TIME_SPAN_IN_MINUTES = Environment.GetEnvironmentVariable("DEFAULT_LOCKOUT_TIME_SPAN_IN_MINUTES") ?? config["EnvironmentConfig:DefaultLockoutTimeSpanInMinutes"] ?? "10";
        var LOCKOUT_MAX_FAILED_ACCESS_ATTEMPTS = Environment.GetEnvironmentVariable("LOCKOUT_MAX_FAILED_ACCESS_ATTEMPTS") ?? config["EnvironmentConfig:LockoutMaxFailedAccessAttempts"] ?? "3";

        // OTP settings environment variables
        var OTP_VALIDITY_IN_MINUTES = Environment.GetEnvironmentVariable("OTP_VALIDITY_IN_MINUTES") ?? config["EnvironmentConfig:OtpValidityInMinutes"] ?? "5";
        var OTP_NUMBER_OF_CHARACTERS = Environment.GetEnvironmentVariable("OTP_NUMBER_OF_CHARACTERS") ?? config["EnvironmentConfig:OtpNumberOfCharacters"] ?? "6";
        var OTP_IS_ALPHA_NUMERIC = Environment.GetEnvironmentVariable("OTP_IS_ALPHA_NUMERIC") ?? config["EnvironmentConfig:OtpIsAlphaNumeric"] ?? "false";

        // Fetch tenant and instance metadata from GlobalAdmin API (paid on-prem deployments only).
        // Community deployments skip this entirely: the type is fixed locally and the enforcement
        // flags default to permissive so login and execution stay enabled.
        string ON_PREM_TENANT_TYPE;
        string ON_PREM_TENANT_NAME;
        string ON_PREM_INSTANCE_TYPE;
        DateTime ON_PREM_CONTRACT_START;
        DateTime ON_PREM_CONTRACT_END;
        int ON_PREM_EXECUTION_TIME_ALLOWED;
        bool ON_PREM_EXECUTION_DISABLED;
        bool ON_PREM_LOGIN_DISABLED;

        if (isCommunityDeployment)
        {
            ON_PREM_TENANT_TYPE = OnPremTenantTypesEnum.Community.ToString();
            ON_PREM_TENANT_NAME = string.Empty;
            ON_PREM_INSTANCE_TYPE = string.Empty;
            ON_PREM_CONTRACT_START = DateTime.MinValue;
            ON_PREM_CONTRACT_END = DateTime.MinValue;
            ON_PREM_EXECUTION_TIME_ALLOWED = 0;
            ON_PREM_EXECUTION_DISABLED = false;
            ON_PREM_LOGIN_DISABLED = false;
        }
        else
        {
            var globalAdminApiBaseUrl = Guard.Against.NullOrWhiteSpace(config["AppDefaultConfig:GlobalAdminApiBaseUrl"], message: "GlobalAdminApiUrl configuration cannot be null or empty");
            var tenantValidationInfo = FetchOnPremTenantMetaDataAsync(globalAdminApiBaseUrl, ON_PREM_TENANT_ID, ON_PREM_INSTANCE_KEY).GetAwaiter().GetResult();
            ON_PREM_TENANT_TYPE = tenantValidationInfo.TenantType;
            ON_PREM_TENANT_NAME = tenantValidationInfo.TenantName;
            ON_PREM_INSTANCE_TYPE = tenantValidationInfo.InstanceType;
            ON_PREM_CONTRACT_START = tenantValidationInfo.ContractStart;
            ON_PREM_CONTRACT_END = tenantValidationInfo.ContractEnd;
            ON_PREM_EXECUTION_TIME_ALLOWED = tenantValidationInfo.ExecutionTimeAllowed;
            ON_PREM_EXECUTION_DISABLED = tenantValidationInfo.ExecutionDisabled;
            ON_PREM_LOGIN_DISABLED = tenantValidationInfo.LoginDisabled;
        }

        // Rozorpay payment gateway environment variables (Only if enabled and tenant type is Commercial)
        var RAZORPAY_ENABLED = bool.Parse(Environment.GetEnvironmentVariable("RAZORPAY_ENABLED") ?? config["EnvironmentConfig:RazorpayEnabled"] ?? "false");
        string RAZORPAY_KEY_ID = string.Empty;
        string RAZORPAY_KEY_SECRET = string.Empty;
        string RAZORPAY_WEBHOOK_SECRET = string.Empty;
        if (RAZORPAY_ENABLED && ON_PREM_TENANT_TYPE == OnPremTenantTypesEnum.Commercial.ToString())
        {
            RAZORPAY_KEY_ID = GetRequiredEnvVar("RAZORPAY_KEY_ID");
            RAZORPAY_KEY_SECRET = GetRequiredEnvVar("RAZORPAY_KEY_SECRET");
            RAZORPAY_WEBHOOK_SECRET = GetRequiredEnvVar("RAZORPAY_WEBHOOK_SECRET");
        }

        // CORS origins configuration
        var EXTRA_CORS_ORIGINS = Environment.GetEnvironmentVariable("EXTRA_CORS_ORIGINS") ?? string.Empty;
        var CORS_ORIGINS = string.IsNullOrEmpty(EXTRA_CORS_ORIGINS)
                            ? $"https://{APP_BASE_URL}"
                            : $"https://{APP_BASE_URL};{EXTRA_CORS_ORIGINS}";

        // Allowed hosts configuration
        var EXTRA_ALLOWED_HOSTS = Environment.GetEnvironmentVariable("EXTRA_ALLOWED_HOSTS") ?? string.Empty;
        var ALLOWED_HOSTS = string.IsNullOrEmpty(EXTRA_ALLOWED_HOSTS)
                            ? $"localhost;{APP_BASE_URL}"
                            : $"localhost;{APP_BASE_URL};{EXTRA_ALLOWED_HOSTS}";

        // Build new configuration with sensitive data from environment variables
        return new ConfigurationBuilder()
            .AddConfiguration(config)
            .AddInMemoryCollection(
                new Dictionary<string, string?>
                {
                    { "EnvironmentConfig:AppBaseUrl", APP_BASE_URL },
                    { "EnvironmentConfig:OnPremTenantId", ON_PREM_TENANT_ID },
                    { "EnvironmentConfig:OnPremInstanceKey", ON_PREM_INSTANCE_KEY },
                    { "EnvironmentConfig:OnPremAdminEmail", ON_PREM_ADMIN_EMAIL },

                    { "EnvironmentConfig:OnPremTenantType", ON_PREM_TENANT_TYPE },
                    { "EnvironmentConfig:OnPremTenantName", ON_PREM_TENANT_NAME },
                    { "EnvironmentConfig:OnPremInstanceType", ON_PREM_INSTANCE_TYPE },
                    { "EnvironmentConfig:OnPremContractStart", ON_PREM_CONTRACT_START.ToString("O") },
                    { "EnvironmentConfig:OnPremContractEnd", ON_PREM_CONTRACT_END.ToString("O") },
                    { "EnvironmentConfig:OnPremExecutionTimeAllowed", ON_PREM_EXECUTION_TIME_ALLOWED.ToString() },
                    { "EnvironmentConfig:OnPremExecutionDisabled", ON_PREM_EXECUTION_DISABLED.ToString() },
                    { "EnvironmentConfig:OnPremLoginDisabled", ON_PREM_LOGIN_DISABLED.ToString() },

                    { "EnvironmentConfig:PostgresqlHost", POSTGRESQL_HOST },
                    { "EnvironmentConfig:PostgresqlPort", POSTGRESQL_PORT },
                    { "EnvironmentConfig:PostgresqlUsername", POSTGRESQL_USERNAME },
                    { "EnvironmentConfig:PostgresqlPassword", POSTGRESQL_PASSWORD },
                    { "EnvironmentConfig:AzureBlobStorageConnectionString", AZURE_BLOB_STORAGE_CONNECTION_STRING },

                    { "EnvironmentConfig:AzureEntraIdEnabled", AZURE_ENTRA_ID_ENABLED.ToString() },
                    { "EnvironmentConfig:AzureTenantId", AZURE_TENANT_ID },
                    { "EnvironmentConfig:AzureEntraIdClientId", AZURE_ENTRA_ID_CLIENT_ID },
                    { "EnvironmentConfig:AzureEntraIdClientSecret", AZURE_ENTRA_ID_CLIENT_SECRET },

                    { "EnvironmentConfig:JwtSecretKey", JWT_SECRET_KEY },
                    { "EnvironmentConfig:JwtValidityInMinutes", JWT_VALIDITY_IN_MINUTES },
                    { "EnvironmentConfig:JwtRefreshTokenValidityInDays", JWT_REFRESH_TOKEN_VALIDITY_IN_DAYS },

                    { "EnvironmentConfig:SmtpHost", SMTP_HOST },
                    { "EnvironmentConfig:SmtpPort", SMTP_PORT },
                    { "EnvironmentConfig:SmtpUser", SMTP_USER },
                    { "EnvironmentConfig:SmtpPassword", SMTP_PASSWORD },
                    { "EnvironmentConfig:SmtpMailFromName", SMTP_MAIL_FROM_NAME },
                    { "EnvironmentConfig:SmtpMailFromAddress", SMTP_MAIL_FROM_ADDRESS },

                    { "EnvironmentConfig:AesEncryptionKey", AES_ENCRYPTION_KEY },
                    { "EnvironmentConfig:AesInitializationVector", AES_INITIALIZATION_VECTOR },

                    { "EnvironmentConfig:RazorpayEnabled", RAZORPAY_ENABLED.ToString() },
                    { "EnvironmentConfig:RazorpayKeyId", RAZORPAY_KEY_ID },
                    { "EnvironmentConfig:RazorpayKeySecret", RAZORPAY_KEY_SECRET },
                    { "EnvironmentConfig:RazorpayWebhookSecret", RAZORPAY_WEBHOOK_SECRET },

                    { "EnvironmentConfig:OpenAiApiKey", OPENAI_API_KEY },
                    { "EnvironmentConfig:DeepInfraApiKey", DEEPINFRA_API_KEY },
                    { "EnvironmentConfig:GeminiApiKey", GEMINI_API_KEY },
                    { "EnvironmentConfig:OpenRouterApiKey", OPENROUTER_API_KEY },

                    { "EnvironmentConfig:CUSTOM_API_KEY", CUSTOM_API_KEY },

                    { "EnvironmentConfig:BrandingAppName", BRANDING_APP_NAME },
                    { "EnvironmentConfig:BrandingCompanyName", BRANDING_COMPANY_NAME },
                    { "EnvironmentConfig:BrandingCompanyLogoUrlLight", BRANDING_COMPANY_LOGO_URL_LIGHT },
                    { "EnvironmentConfig:BrandingCompanyLogoUrlDark", BRANDING_COMPANY_LOGO_URL_DARK },
                    { "EnvironmentConfig:BrandingProductLogoUrlLight", BRANDING_PRODUCT_LOGO_URL_LIGHT },
                    { "EnvironmentConfig:BrandingProductLogoUrlDark", BRANDING_PRODUCT_LOGO_URL_DARK },
                    { "EnvironmentConfig:BrandingShortLogoUrlLight", BRANDING_SHORT_LOGO_URL_LIGHT },
                    { "EnvironmentConfig:BrandingShortLogoUrlDark", BRANDING_SHORT_LOGO_URL_DARK },
                    { "EnvironmentConfig:BrandingFaviconUrlLight", BRANDING_FAVICON_URL_LIGHT },
                    { "EnvironmentConfig:BrandingFaviconUrlDark", BRANDING_FAVICON_URL_DARK },
                    { "EnvironmentConfig:BrandingBackgroundColor", BRANDING_BACKGROUND_COLOR },
                    { "EnvironmentConfig:BrandingForegroundColor", BRANDING_FOREGROUND_COLOR },
                    { "EnvironmentConfig:BrandingPrimaryColor", BRANDING_PRIMARY_COLOR },
                    { "EnvironmentConfig:BrandingPrimaryForegroundColor", BRANDING_PRIMARY_FOREGROUND_COLOR },
                    { "EnvironmentConfig:BrandingSecondaryColor", BRANDING_SECONDARY_COLOR },
                    { "EnvironmentConfig:BrandingSecondaryForegroundColor", BRANDING_SECONDARY_FOREGROUND_COLOR },
                    { "EnvironmentConfig:BrandingAccentColor", BRANDING_ACCENT_COLOR },
                    { "EnvironmentConfig:BrandingAccentForegroundColor", BRANDING_ACCENT_FOREGROUND_COLOR },

                    { "EnvironmentConfig:AccountsApiBaseUrl", ACCOUNTS_API_BASE_URL.TrimEnd('/') },
                    { "EnvironmentConfig:WorkspaceApiBaseUrl", WORKSPACE_API_BASE_URL.TrimEnd('/') },
                    { "EnvironmentConfig:LlmPipelineApiBaseUrl", LLMPIPELINE_API_BASE_URL.TrimEnd('/') },
                    { "EnvironmentConfig:CamelApiBaseUrl", CAMEL_API_BASE_URL.TrimEnd('/') },
                    { "EnvironmentConfig:CorsairApiBaseUrl", CORSAIR_API_BASE_URL.TrimEnd('/') },
                    { "EnvironmentConfig:CorsairRedirectUri", CORSAIR_REDIRECT_URI },

                    { "EnvironmentConfig:SalesEmails", SALES_EMAILS },

                    { "EnvironmentConfig:MaxActiveSessionAllowed", MAX_ACTIVE_SESSION_ALLOWED },
                    { "EnvironmentConfig:ObsoletePwdRetainLimit", OBSOLETE_PWD_RETAIN_LIMIT },
                    { "EnvironmentConfig:DefaultLockoutTimeSpanInMinutes", DEFAULT_LOCKOUT_TIME_SPAN_IN_MINUTES },
                    { "EnvironmentConfig:LockoutMaxFailedAccessAttempts", LOCKOUT_MAX_FAILED_ACCESS_ATTEMPTS },

                    { "EnvironmentConfig:OtpValidityInMinutes", OTP_VALIDITY_IN_MINUTES },
                    { "EnvironmentConfig:OtpNumberOfCharacters", OTP_NUMBER_OF_CHARACTERS },
                    { "EnvironmentConfig:OtpIsAlphaNumeric", OTP_IS_ALPHA_NUMERIC },

                    { "EnvironmentConfig:CorsOrigins", CORS_ORIGINS },

                    { "AllowedHosts", ALLOWED_HOSTS }
                }
            )
            .Build();
    }

    /// <summary>
    /// Normalizes an optional string value: trims it, treats blank as null, and drops values
    /// longer than <paramref name="maxLength"/> with a warning.
    /// </summary>
    private static string? NormalizeOptional(string key, string? value, int maxLength = int.MaxValue)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        var normalizedValue = value.Trim();
        if (normalizedValue.Length > maxLength)
        {
            Console.Error.WriteLine(
                $"{key} exceeds {maxLength} characters; ignoring the value and using the default branding."
            );
            return null;
        }

        return normalizedValue;
    }

    /// <summary>
    /// Validates an optional branding URL. The URL must be absolute HTTPS and hosted on the
    /// deployment's own domain (the <c>APP_BASE_URL</c> host), a subdomain of it, or a host under
    /// its parent domain; anything else is dropped with a warning so the client falls back to
    /// defaults.
    /// </summary>
    private static string? SanitizeBrandingUrl(string key, string? value, string appBaseUrl)
    {
        var normalizedValue = NormalizeOptional(key, value);
        if (normalizedValue == null)
        {
            return null;
        }

        // Branding assets must be served over HTTPS.
        if (!Uri.TryCreate(normalizedValue, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps)
        {
            Console.Error.WriteLine(
                $"{key} must be an absolute https URL; ignoring the value and using the default branding."
            );
            return null;
        }

        // ...and from the deployment's domain (subdomains and sibling hosts allowed).
        if (!IsDeploymentHost(uri.Host, appBaseUrl))
        {
            Console.Error.WriteLine(
                $"{key} must be hosted on {appBaseUrl}, a subdomain of it, or a host under its parent domain; ignoring the value and using the default branding."
            );
            return null;
        }

        return normalizedValue;
    }

    /// <summary>
    /// True when the candidate host is the deployment host, a subdomain of it, or a host under
    /// the deployment host's parent domain (sibling environments such as
    /// <c>local-avintra.aventisia.com</c> and <c>uat-avintra.aventisia.com</c>).
    /// </summary>
    /// <remarks>
    /// The parent-domain rule is skipped when it would leave a single label. It widens the accepted
    /// set to the whole shared parent domain, so a deployment host under a multi-part public suffix
    /// such as <c>co.uk</c> trusts every sibling host under it.
    /// </remarks>
    private static bool IsDeploymentHost(string candidateHost, string appBaseUrl)
    {
        var baseHost = GetHostFromValue(appBaseUrl).TrimEnd('.');
        var normalizedCandidate = candidateHost.ToLowerInvariant().TrimEnd('.');
        if (string.IsNullOrWhiteSpace(baseHost) || string.IsNullOrWhiteSpace(normalizedCandidate))
        {
            return false;
        }

        if (string.Equals(normalizedCandidate, baseHost, StringComparison.OrdinalIgnoreCase)
            || normalizedCandidate.EndsWith("." + baseHost, StringComparison.OrdinalIgnoreCase)
            || (normalizedCandidate.Contains('.')
                && baseHost.EndsWith("." + normalizedCandidate, StringComparison.OrdinalIgnoreCase)))
        {
            return true;
        }

        var parentHost = GetParentHost(baseHost);
        return parentHost != null
            && (string.Equals(normalizedCandidate, parentHost, StringComparison.OrdinalIgnoreCase)
                || normalizedCandidate.EndsWith("." + parentHost, StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// The deployment host without its leading label, or null when that leaves a single label.
    /// </summary>
    private static string? GetParentHost(string baseHost)
    {
        var separatorIndex = baseHost.IndexOf('.');
        if (separatorIndex < 0)
        {
            return null;
        }

        var parentHost = baseHost[(separatorIndex + 1)..];
        return parentHost.Contains('.') ? parentHost : null;
    }

    /// <summary>
    /// Extracts the bare host from a deployment base URL value, which may be a bare host,
    /// a host:port, or a full URL.
    /// </summary>
    private static string GetHostFromValue(string value)
    {
        var candidate = value.Trim();

        // Accept full URLs as well as bare hosts.
        if (Uri.TryCreate(candidate, UriKind.Absolute, out var uri) && !string.IsNullOrWhiteSpace(uri.Host))
        {
            return uri.Host;
        }

        var hostPart = candidate.Split('/')[0];
        return hostPart.Split(':')[0].ToLowerInvariant();
    }

    /// <summary>
    /// Validates an optional branding CSS color (hex, rgb/rgba or hsl/hsla). An invalid value is
    /// dropped with a warning so the client falls back to defaults.
    /// </summary>
    private static string? SanitizeBrandingColor(string key, string? value)
    {
        var normalizedValue = NormalizeOptional(key, value);
        if (normalizedValue == null)
        {
            return null;
        }

        if (BrandingHexColorRegex.IsMatch(normalizedValue) ||
            BrandingRgbColorRegex.IsMatch(normalizedValue) ||
            BrandingHslColorRegex.IsMatch(normalizedValue))
        {
            return normalizedValue;
        }

        Console.Error.WriteLine(
            $"{key} is not a valid hex, rgb() or hsl() color; ignoring the value and using the default branding."
        );
        return null;
    }

    /// <summary>
    /// Helper method to get required environment variable with standard error message
    /// </summary>
    private static string GetRequiredEnvVar(string key)
    {
        return Guard.Against.NullOrWhiteSpace(
            Environment.GetEnvironmentVariable(key),
            message: $"{key} environment variable cannot be null or empty"
        );
    }

    /// <summary>
    /// Fetches tenant and instance information from the GlobalAdmin API
    /// </summary>
    private static async Task<OnPremDeploymentMetaDataDto> FetchOnPremTenantMetaDataAsync(
        string globalAdminApiBaseUrl, string ON_PREM_TENANT_ID, string ON_PREM_INSTANCE_KEY
    )
    {
        // Make HTTP request to GlobalAdmin API
        using var httpClient = new HttpClient();
        try
        {
            // Add the Tenant ID and Instance Key headers for authentication
            httpClient.DefaultRequestHeaders.Add("X-OnPrem-Tenant-Id", $"{ON_PREM_TENANT_ID}");
            httpClient.DefaultRequestHeaders.Add("X-OnPrem-Instance-Key", $"{ON_PREM_INSTANCE_KEY}");

            var request = new HttpRequestMessage(HttpMethod.Get, $"{globalAdminApiBaseUrl}/api/onprem/instance/metadata")
            {
                Version = HttpVersion.Version20,
                VersionPolicy = HttpVersionPolicy.RequestVersionExact
            };

            // Get tenant metadata
            var response = await httpClient.SendAsync(request);

            // Check if the response was successful
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException(
                    $"Failed to fetch on prem tenant information from aventisia's servers. Status: {response.StatusCode}, Error: {errorContent}"
                );
            }

            // Deserialize and return the tenant validation DTO
            return Guard.Against.Null(
                (await response.Content.ReadFromJsonAsync<ServiceResponse<OnPremDeploymentMetaDataDto>>())?.Data,
                message: "Tenant validation response from GlobalAdmin API cannot be null"
            );
        }
        catch (HttpRequestException ex)
        {
            throw new InvalidOperationException(
                "Failed to connect to GlobalAdmin API. Please ensure the API is accessible.",
                ex
            );
        }
    }
}
