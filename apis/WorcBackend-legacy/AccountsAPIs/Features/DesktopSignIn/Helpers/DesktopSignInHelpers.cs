namespace AccountsAPIs.Helpers;

/// <summary>
/// Validation and hashing helpers for the desktop sign-in hand-back.
/// </summary>
public static class DesktopSignInHelpers
{
    private static readonly Regex CodeChallengePattern = new("^[A-Za-z0-9_-]{43}$", RegexOptions.Compiled);
    private static readonly Regex CodeVerifierPattern = new("^[A-Za-z0-9_-]{43,128}$", RegexOptions.Compiled);

    /// <summary>
    /// True when the value is a return address of the form http://127.0.0.1:port/ or http://localhost:port/, and nothing else.
    /// </summary>
    public static bool IsLoopbackRedirectUri(string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || !Uri.TryCreate(value, UriKind.Absolute, out var uri)) return false;
        if (uri.Scheme != Uri.UriSchemeHttp || !string.IsNullOrEmpty(uri.UserInfo)) return false;
        if (uri.AbsolutePath != "/" || !string.IsNullOrEmpty(uri.Query) || !string.IsNullOrEmpty(uri.Fragment)) return false;
        if (uri.IsDefaultPort || uri.Port <= 0) return false;

        return uri.Host == "127.0.0.1" || string.Equals(uri.Host, "localhost", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// True when the value is a base64url encoded PKCE S256 code challenge.
    /// </summary>
    public static bool IsValidCodeChallenge(string? value) => value != null && CodeChallengePattern.IsMatch(value);

    /// <summary>
    /// True when the value is a PKCE code verifier.
    /// </summary>
    public static bool IsValidCodeVerifier(string? value) => value != null && CodeVerifierPattern.IsMatch(value);

    /// <summary>
    /// Returns the hex SHA-256 hash of a value so the cache stores no state or challenge verbatim.
    /// </summary>
    public static string GenerateHash(string value) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

    /// <summary>
    /// True when the value hashes to the stored hex hash, compared in constant time.
    /// </summary>
    public static bool IsHashMatch(string? storedHash, string value) =>
        storedHash != null
        && CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(storedHash),
            Encoding.UTF8.GetBytes(GenerateHash(value)));
}
