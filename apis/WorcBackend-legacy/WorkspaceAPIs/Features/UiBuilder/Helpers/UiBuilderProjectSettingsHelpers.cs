using System.Text.RegularExpressions;

namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Validation and normalization for custom UI builder project settings, themes, and assets.
/// </summary>
public static class UiBuilderProjectSettingsHelpers
{
    /// <summary>
    /// Maximum number of assets one project can hold.
    /// </summary>
    public const int MaxAssetsPerProject = 20;

    /// <summary>
    /// Maximum size of one asset in bytes.
    /// </summary>
    public const int MaxAssetBytes = 512 * 1024;

    private static readonly Regex HexColorPattern = new("^#[0-9a-fA-F]{6}$", RegexOptions.Compiled);
    private static readonly Regex AssetNamePattern = new("^[A-Za-z][A-Za-z0-9_-]{0,63}$", RegexOptions.Compiled);

    private static readonly string[] NeutralColors = ["slate", "gray", "zinc", "neutral", "stone"];
    private static readonly string[] Radii = ["none", "sm", "md", "lg", "xl"];
    private static readonly string[] FontFamilies = ["inter", "system", "serif", "mono"];
    private static readonly string[] Modes = ["light", "dark"];
    private static readonly string[] AssetContentTypes = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];

    /// <summary>
    /// Normalizes a theme in place and returns an error message when a value is not supported.
    /// </summary>
    public static string? NormalizeTheme(UiBuilderThemeDto? theme)
    {
        if (theme == null)
        {
            return null;
        }

        theme.PrimaryColor = theme.PrimaryColor.Trim().ToLowerInvariant();
        theme.NeutralColor = theme.NeutralColor.Trim().ToLowerInvariant();
        theme.Radius = theme.Radius.Trim().ToLowerInvariant();
        theme.FontFamily = theme.FontFamily.Trim().ToLowerInvariant();
        theme.Mode = theme.Mode.Trim().ToLowerInvariant();

        if (!HexColorPattern.IsMatch(theme.PrimaryColor))
        {
            return "Primary color must be a 6-digit hex value such as #4f46e5.";
        }

        if (!NeutralColors.Contains(theme.NeutralColor))
        {
            return $"Neutral color must be one of: {string.Join(", ", NeutralColors)}.";
        }

        if (!Radii.Contains(theme.Radius))
        {
            return $"Radius must be one of: {string.Join(", ", Radii)}.";
        }

        if (!FontFamilies.Contains(theme.FontFamily))
        {
            return $"Font family must be one of: {string.Join(", ", FontFamilies)}.";
        }

        if (!Modes.Contains(theme.Mode))
        {
            return $"Mode must be one of: {string.Join(", ", Modes)}.";
        }

        return null;
    }

    /// <summary>
    /// Validates an asset upload and returns its decoded bytes, or an error message.
    /// </summary>
    public static (byte[]? Data, string? Error) ValidateAsset(UiBuilderAssetDto asset)
    {
        if (!AssetNamePattern.IsMatch(asset.Name ?? string.Empty))
        {
            return (null, "Asset name must start with a letter and use only letters, digits, '_' or '-' (max 64).");
        }

        if (!AssetContentTypes.Contains(asset.ContentType))
        {
            return (null, $"Asset type must be one of: {string.Join(", ", AssetContentTypes)}.");
        }

        if (string.IsNullOrWhiteSpace(asset.DataBase64))
        {
            return (null, "Asset data is required.");
        }

        byte[] data;
        try
        {
            data = Convert.FromBase64String(asset.DataBase64);
        }
        catch (FormatException)
        {
            return (null, "Asset data must be base64 encoded.");
        }

        if (data.Length == 0 || data.Length > MaxAssetBytes)
        {
            return (null, $"Asset must be between 1 byte and {MaxAssetBytes / 1024} KB.");
        }

        return (data, null);
    }
}
