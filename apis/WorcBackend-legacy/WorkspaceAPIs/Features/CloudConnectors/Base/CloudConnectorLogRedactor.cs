using NodeLibrary.Helpers;

namespace WorkspaceAPIs.Features.CloudConnectors;

/// <summary>
/// Removes secret values from connector messages before they reach an execution log.
/// </summary>
public static class CloudConnectorLogRedactor
{
    private const string Placeholder = "[REDACTED]";

    private const int MinSecretLength = 4;

    private const int MaxProviderReasonLength = 200;

    // IMPORTANT NOTE: short secret values are left alone because replacing a value this short would
    // corrupt unrelated words in the message; the per-site known-secret redaction is the primary
    // guarantee, the pattern scrub only catches conventional key/value shapes.

    /// <summary>
    /// Replaces every known secret value in the message with a placeholder.
    /// </summary>
    public static string Redact(string? message, params string?[] secrets)
    {
        if (string.IsNullOrEmpty(message))
        {
            return message ?? string.Empty;
        }

        var redacted = message;
        foreach (var secret in secrets.Where(s => !string.IsNullOrWhiteSpace(s) && s.Length >= MinSecretLength)
                                      .OrderByDescending(s => s!.Length))
        {
            redacted = redacted.Replace(secret!, Placeholder, StringComparison.Ordinal);
        }

        return redacted;
    }

    /// <summary>
    /// Returns each secret together with its URL-escaped form so an echoed query string is redacted too.
    /// </summary>
    public static string[] WithEscapedForms(params string?[] secrets)
    {
        var values = new List<string>();
        foreach (var secret in secrets)
        {
            if (string.IsNullOrWhiteSpace(secret))
            {
                continue;
            }

            values.Add(secret);
            var escaped = Uri.EscapeDataString(secret);
            if (!string.Equals(escaped, secret, StringComparison.Ordinal))
            {
                values.Add(escaped);
            }
        }

        return [.. values];
    }

    /// <summary>
    /// Masks values that follow a secret-like key or an <c>Authorization</c> header.
    /// </summary>
    public static string ScrubSecretPatterns(string? text) => NodeLogHelper.ScrubSecretPatterns(text);

    /// <summary>
    /// Produces a short, single-line provider reason safe to append to a rejection message.
    /// </summary>
    public static string RedactProviderReason(string? reason, params string?[] secrets)
    {
        var redacted = ScrubSecretPatterns(Redact(reason, secrets));
        redacted = Regex.Replace(redacted, @"\s+", " ").Trim();
        return redacted.Length > MaxProviderReasonLength
            ? redacted[..MaxProviderReasonLength] + "..."
            : redacted;
    }

    /// <summary>
    /// Replaces line breaks in a value so it cannot forge extra log entries.
    /// </summary>
    public static string SanitizeForLog(string? value) =>
        value is null ? string.Empty : value.Replace("\r", " ").Replace("\n", " ");
}
