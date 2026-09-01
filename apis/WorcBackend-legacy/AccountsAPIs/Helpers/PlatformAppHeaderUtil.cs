namespace AccountsAPIs.Helpers;

public static class PlatformAppHeaderUtil
{
    /// <summary>
    /// Header every calling frontend must send to identify which platform app the request is coming from.
    /// </summary>
    public const string HeaderName = "X-App-Context";

    /// <summary>
    /// Parses an app code (e.g. "workspace" from the X-App-Context header) into a PlatformAppsEnum.
    /// Returns false when the value is missing or not a canonical app name.
    /// </summary>
    public static bool TryParseAppCode(string? appCode, out PlatformAppsEnum platformApp)
    {
        platformApp = default;
        if (string.IsNullOrWhiteSpace(appCode)) return false;

        var normalized = appCode.Trim();

        // Enum.TryParse happily coerces numeric ("0", "1") and composite ("Workspace,CRM") values
        // into the enum. Accept only a value whose canonical name matches, so the header must be
        // a plain app name (case-insensitive).
        return Enum.TryParse(normalized, ignoreCase: true, out platformApp)
            && Enum.IsDefined(platformApp)
            && string.Equals(platformApp.ToString(), normalized, StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Returns the stable string code of the app (lowercase enum name), as stored in the Roles.AppCode column.
    /// </summary>
    public static string ToAppCode(this PlatformAppsEnum platformApp)
    {
        return platformApp.ToString().ToLowerInvariant();
    }
}