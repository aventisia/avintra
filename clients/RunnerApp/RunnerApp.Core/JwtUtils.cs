using System.Text.Json;

namespace RunnerApp.Services;

/// <summary>
/// Shared JWT payload helpers for parsing claims and expiry from machine JWTs without a token
/// library. Parses the middle segment of a header.payload.signature JWT as JSON and always
/// disposes the parsed document.
/// </summary>
internal static class JwtUtils
{
    // Extracts a top-level string claim from the JWT payload; empty when missing/unparsable.
    public static string GetClaim(string jwt, string claimName)
    {
        try
        {
            var parts = jwt.Split('.');
            if (parts.Length != 3)
                return string.Empty;

            using var payload = JsonDocument.Parse(Base64UrlDecode(parts[1]));
            if (payload.RootElement.TryGetProperty(claimName, out var claim))
                return claim.GetString() ?? string.Empty;
        }
        catch
        {
            // Fall through to empty; the backend will reject the request.
        }

        return string.Empty;
    }

    // Reads the "exp" claim as a UTC timestamp; null when missing or unparsable.
    public static DateTimeOffset? TryReadExpiry(string jwt)
    {
        try
        {
            var parts = jwt.Split('.');
            if (parts.Length != 3)
                return null;

            using var payload = JsonDocument.Parse(Base64UrlDecode(parts[1]));
            if (payload.RootElement.TryGetProperty("exp", out var exp) && exp.TryGetInt64(out var unixSeconds))
                return DateTimeOffset.FromUnixTimeSeconds(unixSeconds);
        }
        catch
        {
            // Fall through: unknown expiry forces a refresh on the first backend call.
        }

        return null;
    }

    public static string Base64UrlDecode(string input)
    {
        var padded = input.Replace('-', '+').Replace('_', '/');
        switch (padded.Length % 4)
        {
            case 2: padded += "=="; break;
            case 3: padded += "="; break;
        }

        return System.Text.Encoding.UTF8.GetString(System.Convert.FromBase64String(padded));
    }
}