namespace WorkspaceAPIs.Helpers;

public static class SearchByQueryHelpers
{
    public static string EscapeLikePattern(string value)
    {
        return value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
    }
}
