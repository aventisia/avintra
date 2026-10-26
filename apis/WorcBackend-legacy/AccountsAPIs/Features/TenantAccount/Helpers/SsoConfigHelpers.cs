using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace AccountsAPIs.Helpers;

/// <summary>
/// Parsing, validation and redaction helpers for the versioned tenant SSO configuration.
/// </summary>
public static class SsoConfigHelpers
{
    /// <summary>
    /// Supported provider key for the r1 single sign-on configuration.
    /// </summary>
    public const string MicrosoftEntraProvider = "microsoft_entra";

    /// <summary>
    /// Supported schema version of the stored single sign-on document.
    /// </summary>
    public const int SchemaVersion = 1;

    /// <summary>
    /// Message shown to a passwordless user whose tenant's single sign-on was disabled.
    /// </summary>
    public const string SsoDisabledMessage = "SSO disabled - set your password";

    private static readonly string[] ConsumerEmailDomains =
    {
        "gmail.com",
        "outlook.com",
        "hotmail.com",
        "live.com",
        "msn.com",
        "yahoo.com",
        "icloud.com",
        "aol.com",
        "protonmail.com"
    };

    private const int TenantDomainMaxLength = 100;

    private static readonly Regex TenantDomainRegex = new(
        @"^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
        RegexOptions.Compiled);

    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    /// <summary>
    /// Indicates whether the provided email domain belongs to a public/consumer mail provider.
    /// </summary>
    public static bool IsConsumerEmailDomain(string? emailDomain)
    {
        if (string.IsNullOrWhiteSpace(emailDomain)) return false;

        return ConsumerEmailDomains.Contains(emailDomain.Trim().ToLowerInvariant());
    }

    /// <summary>
    /// True when the value is blank or a valid tenant email domain of at most 100 characters.
    /// </summary>
    public static bool IsValidTenantDomain(string? domain)
    {
        var normalizedDomain = domain?.Trim() ?? string.Empty;
        if (normalizedDomain.Length == 0) return true;
        if (normalizedDomain.Length > TenantDomainMaxLength) return false;

        return TenantDomainRegex.IsMatch(normalizedDomain);
    }

    /// <summary>
    /// True when the signed-in administrator's email belongs to the tenant's email domain.
    /// </summary>
    public static bool DoesAdminEmailMatchTenantDomain(string? adminEmail, string? tenantDomain)
    {
        var adminEmailDomain = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(adminEmail ?? string.Empty).Trim();

        return adminEmailDomain.Length > 0
            && string.Equals(adminEmailDomain, tenantDomain?.Trim() ?? string.Empty, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// True when single sign-on is offered for the tenant: the deployment allows it, the tenant switch is on,
    /// and the stored connection is bound to an external tenant id for a non-blank domain.
    /// </summary>
    public static bool IsSsoOfferedForTenant(Tenant? tenant, bool isSsoAllowedForDeployment, bool microsoftSsoEnabled)
    {
        if (tenant == null || !isSsoAllowedForDeployment || !microsoftSsoEnabled) return false;
        if (!tenant.IsSSOEnabled || string.IsNullOrWhiteSpace(tenant.Domain)) return false;

        var storedConfig = Parse(tenant.SSOConfigJson);

        return !string.IsNullOrWhiteSpace(storedConfig?.ExternalTenantId);
    }

    /// <summary>
    /// Parses the stored or submitted single sign-on document. Returns null for empty, malformed,
    /// unsupported-version or unsupported-provider content.
    /// </summary>
    public static TenantSsoConfigDto? Parse(string? ssoConfigJson)
    {
        if (string.IsNullOrWhiteSpace(ssoConfigJson)) return null;

        try
        {
            var config = JsonSerializer.Deserialize<TenantSsoConfigDto>(ssoConfigJson, SerializerOptions);

            if (config == null) return null;
            if (config.V != SchemaVersion) return null;
            if (!string.Equals(config.Provider, MicrosoftEntraProvider, StringComparison.OrdinalIgnoreCase)) return null;

            return config;
        }
        catch (JsonException)
        {
            return null;
        }
    }

    /// <summary>
    /// Serializes the configuration for persistence.
    /// </summary>
    public static string ToPersistedJson(TenantSsoConfigDto config)
    {
        return JsonSerializer.Serialize(config, SerializerOptions);
    }

    /// <summary>
    /// Serializes the configuration for a response.
    /// </summary>
    public static string ToRedactedJson(TenantSsoConfigDto config)
    {
        return JsonSerializer.Serialize(config, SerializerOptions);
    }

    /// <summary>
    /// Creates the default v1 configuration for the provided tenant domain and external tenant id.
    /// </summary>
    public static TenantSsoConfigDto CreateDefault(string externalTenantId, string emailDomain)
    {
        return new TenantSsoConfigDto
        {
            V = SchemaVersion,
            Provider = MicrosoftEntraProvider,
            ExternalTenantId = externalTenantId?.Trim() ?? string.Empty,
            EmailDomain = emailDomain?.Trim().ToLowerInvariant() ?? string.Empty
        };
    }

    /// <summary>
    /// Builds the token validation parameters used to verify an Entra id_token: JWKS signature (RS256 only),
    /// audience, lifetime with zero clock skew. Issuer and tenant binding are asserted by the caller against
    /// the verified tenant claim and the registered configuration.
    /// </summary>
    public static TokenValidationParameters BuildEntraIdTokenValidationParameters(OpenIdConnectConfiguration configuration, string clientId)
    {
        return new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKeys = configuration.SigningKeys,
            RequireSignedTokens = true,
            ValidAlgorithms = new[] { "RS256" },
            ValidateIssuer = false,
            ValidateAudience = true,
            ValidAudience = clientId,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    }
}
