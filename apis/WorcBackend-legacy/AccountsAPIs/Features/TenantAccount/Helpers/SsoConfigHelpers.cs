using System.Text.Json.Serialization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace AccountsAPIs.Helpers;

/// <summary>
/// Parsing, validation, redaction and at-rest protection helpers for the versioned tenant SSO configuration.
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
    /// DataProtection purpose used to protect tenant-supplied client secrets at rest.
    /// </summary>
    public const string SecretProtectionPurpose = "TenantSso/v1";

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
    /// Serializes the configuration for persistence, always dropping the transient plaintext secret.
    /// </summary>
    public static string ToPersistedJson(TenantSsoConfigDto config)
    {
        config.ByoClientSecret = null;
        return JsonSerializer.Serialize(config, SerializerOptions);
    }

    /// <summary>
    /// Serializes the configuration for a response, dropping both the plaintext and the protected secret.
    /// </summary>
    public static string ToRedactedJson(TenantSsoConfigDto config)
    {
        config.ByoClientSecret = null;
        config.ByoClientSecretProtected = null;
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
    /// Copies the mutable configuration fields so callers can mutate without touching the source document.
    /// </summary>
    public static TenantSsoConfigDto Clone(TenantSsoConfigDto config)
    {
        return new TenantSsoConfigDto
        {
            V = config.V,
            Provider = config.Provider,
            ExternalTenantId = config.ExternalTenantId,
            EmailDomain = config.EmailDomain,
            ByoClientId = config.ByoClientId,
            ByoClientSecret = config.ByoClientSecret,
            ByoClientSecretProtected = config.ByoClientSecretProtected,
            DomainVerified = config.DomainVerified,
            DomainVerifiedOn = config.DomainVerifiedOn,
            DomainVerifiedBy = config.DomainVerifiedBy
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

    /// <summary>
    /// Protects a plaintext tenant client secret with ASP.NET DataProtection.
    /// </summary>
    public static string? ProtectSecret(IDataProtector protector, string? plaintextSecret)
    {
        if (string.IsNullOrWhiteSpace(plaintextSecret)) return null;

        return protector.Protect(plaintextSecret);
    }

    /// <summary>
    /// Unprotects a stored tenant client secret. Returns null when the payload is absent or undecryptable.
    /// </summary>
    public static string? UnprotectSecret(IDataProtector protector, string? protectedSecret)
    {
        if (string.IsNullOrWhiteSpace(protectedSecret)) return null;

        try
        {
            return protector.Unprotect(protectedSecret);
        }
        catch (CryptographicException)
        {
            return null;
        }
    }
}
