namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// Builds case-insensitive exact-match patterns for tool-name database lookups.
/// </summary>
public static class ToolNameMatchHelpers
{
    /// <summary>
    /// Escapes LIKE wildcards so a tool name matches literally under <c>ILIKE</c>.
    /// </summary>
    public static string ToExactMatchPattern(string value) =>
        value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
