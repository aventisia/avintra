namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Content format values and normalization for custom UI builder versions.
/// </summary>
public static class UiBuilderContentFormatHelpers
{
    /// <summary>
    /// Content format for a single standalone HTML version.
    /// </summary>
    public const string Html = "html";

    /// <summary>
    /// Content format for a React framework version.
    /// </summary>
    public const string Framework = "framework";

    /// <summary>
    /// Returns the normalized content format, or null when the format is unsupported.
    /// </summary>
    public static string? NormalizeContentFormat(string? contentFormat)
    {
        var candidate = (contentFormat ?? string.Empty).Trim();

        if (candidate.Length == 0)
        {
            return Html;
        }

        if (string.Equals(candidate, Html, StringComparison.OrdinalIgnoreCase))
        {
            return Html;
        }

        if (string.Equals(candidate, Framework, StringComparison.OrdinalIgnoreCase))
        {
            return Framework;
        }

        return null;
    }
}
