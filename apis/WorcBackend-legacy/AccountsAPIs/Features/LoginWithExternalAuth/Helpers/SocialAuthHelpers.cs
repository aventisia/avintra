namespace AccountsAPIs.Helpers;

/// <summary>
/// Constants and pure helpers shared by the social sign-in flow.
/// </summary>
public static class SocialAuthHelpers
{
    /// <summary>
    /// Provider key stored in the login table and used by the clients for Google.
    /// </summary>
    public const string GoogleProvider = "Google";

    /// <summary>
    /// Provider key stored in the login table and used by the clients for GitHub.
    /// </summary>
    public const string GitHubProvider = "GitHub";

    /// <summary>
    /// Message returned when the installation has turned authentication off.
    /// </summary>
    public const string LoginDisabledMessage =
        "Authentication is currently disabled. Please contact Aventisia Support for assistance.";

    /// <summary>
    /// Message returned when the requested provider is not set up on this installation.
    /// </summary>
    public const string NotConfiguredMessage = "Social sign-in is not configured.";

    /// <summary>
    /// Message shown when GitHub reports the account's primary email as unverified.
    /// </summary>
    public const string GitHubEmailNotVerifiedMessage =
        "Verify your primary email address on GitHub, or sign up with email.";

    /// <summary>
    /// Prefix of the HttpOnly cookie that binds one authorization attempt to the browser that started it.
    /// </summary>
    public const string BindingCookieNamePrefix = "social-bind-";

    /// <summary>
    /// Returns the name of the binding cookie of one authorization attempt.
    /// </summary>
    public static string GetBindingCookieName(string state) => $"{BindingCookieNamePrefix}{state}";

    /// <summary>
    /// Prefix that lets the callback screen tell a social attempt apart from an Entra attempt.
    /// </summary>
    public const string StatePrefix = "social.";

    /// <summary>
    /// Generates the opaque state of a social authorization attempt.
    /// </summary>
    public static string GenerateSocialState() => StatePrefix + GenerateOpaqueValue();

    /// <summary>
    /// Returns the client-facing provider name, or null when the provider is not a social provider.
    /// </summary>
    public static string? GetProviderName(ExternalAuthProviderEnum provider) => provider switch
    {
        ExternalAuthProviderEnum.Google => GoogleProvider,
        ExternalAuthProviderEnum.GitHub => GitHubProvider,
        _ => null
    };

    /// <summary>
    /// Parses a client-supplied provider name, returning null for anything that is not Google or GitHub.
    /// </summary>
    public static ExternalAuthProviderEnum? ParseProvider(string? provider)
    {
        if (string.Equals(provider, GoogleProvider, StringComparison.OrdinalIgnoreCase))
            return ExternalAuthProviderEnum.Google;

        if (string.Equals(provider, GitHubProvider, StringComparison.OrdinalIgnoreCase))
            return ExternalAuthProviderEnum.GitHub;

        return null;
    }

    /// <summary>
    /// True when this deployment offers social sign-in at all.
    /// </summary>
    public static bool IsSocialOffered(EnvironmentConfig environmentConfig) =>
        !environmentConfig.OnPremLoginDisabled
        && environmentConfig.OnPremTenantType != OnPremTenantTypesEnum.Enterprise.ToString();

    /// <summary>
    /// True when the deployment has the credentials of the provider.
    /// </summary>
    public static bool IsSocialConfigured(EnvironmentConfig environmentConfig, ExternalAuthProviderEnum? provider) => provider switch
    {
        ExternalAuthProviderEnum.Google =>
            !string.IsNullOrWhiteSpace(environmentConfig.GoogleOAuthClientId)
            && !string.IsNullOrWhiteSpace(environmentConfig.GoogleOAuthClientSecret),
        ExternalAuthProviderEnum.GitHub =>
            !string.IsNullOrWhiteSpace(environmentConfig.GitHubOAuthClientId)
            && !string.IsNullOrWhiteSpace(environmentConfig.GitHubOAuthClientSecret),
        _ => false
    };

    /// <summary>
    /// Returns the social provider already linked to the account, or null when it has none.
    /// </summary>
    public static async Task<string?> GetLinkedProviderAsync(UserManager<AccountUser> userManager, AccountUser user)
    {
        var logins = await userManager.GetLoginsAsync(user);

        return logins.FirstOrDefault(l =>
            l.LoginProvider == GoogleProvider || l.LoginProvider == GitHubProvider)?.LoginProvider;
    }

    /// <summary>
    /// True when the provider owns the mailbox, so linking an existing account needs no confirmation code.
    /// </summary>
    public static bool IsProviderOwnedMailbox(ExternalAuthProviderEnum provider, string email, bool hasGoogleHostedDomain)
    {
        if (provider != ExternalAuthProviderEnum.Google) return false;
        if (hasGoogleHostedDomain) return true;

        return email.EndsWith("@gmail.com", StringComparison.OrdinalIgnoreCase)
            || email.EndsWith("@googlemail.com", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// True when the value is a site-relative path that cannot leave the origin. Mirrors the client rule:
    /// protocol-relative, backslash, absolute, encoded-absolute and control-character forms are rejected.
    /// </summary>
    public static bool IsSameOriginPath(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value[0] != '/') return false;

        string decoded;
        try
        {
            decoded = Uri.UnescapeDataString(value);
        }
        catch (UriFormatException)
        {
            return false;
        }

        if (!decoded.StartsWith('/') || decoded.StartsWith("//", StringComparison.Ordinal)) return false;
        if (decoded.Contains('\\') || decoded.Contains("://", StringComparison.Ordinal)) return false;

        return !decoded.Any(character => character <= '\u001f' || character == '\u007f');
    }

    /// <summary>
    /// Generates a 256-bit opaque value for states, nonces and browser binding tokens.
    /// </summary>
    public static string GenerateOpaqueValue() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

    /// <summary>
    /// Generates a PKCE code verifier: 32 random bytes, base64url encoded.
    /// </summary>
    public static string GenerateCodeVerifier() => Base64UrlEncode(RandomNumberGenerator.GetBytes(32));

    /// <summary>
    /// Derives the PKCE S256 code challenge of a verifier.
    /// </summary>
    public static string GenerateCodeChallenge(string codeVerifier) =>
        Base64UrlEncode(SHA256.HashData(Encoding.ASCII.GetBytes(codeVerifier)));

    /// <summary>
    /// Binds an authorization attempt to the browser cookie value and the client it was started from.
    /// </summary>
    public static string GenerateBindingHash(string cookieValue, string userAgent) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes($"{cookieValue}|{userAgent}")));

    /// <summary>
    /// Splits a provider-supplied full name into first and last name.
    /// </summary>
    public static (string FirstName, string LastName) SplitFullName(string? fullName)
    {
        var parts = (fullName ?? string.Empty).Split(' ', StringSplitOptions.RemoveEmptyEntries);

        return parts.Length switch
        {
            0 => (string.Empty, string.Empty),
            1 => (parts[0], string.Empty),
            _ => (parts[0], string.Join(' ', parts.Skip(1)))
        };
    }

    private static string Base64UrlEncode(byte[] value) =>
        Convert.ToBase64String(value).TrimEnd('=').Replace('+', '-').Replace('/', '_');
}
