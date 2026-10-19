namespace WorkspaceAPIs.Helpers;

public static class ResourceFlowAccessHelpers
{
    private const string ToolsReferenceKey = "tools";

    /// <summary>
    /// Reads the referenced tool names stored in the publish snapshot. Returns null when the snapshot is not valid JSON.
    /// </summary>
    public static List<string>? TryReadReferencedToolNames(string? resourceReferences)
    {
        if (string.IsNullOrWhiteSpace(resourceReferences))
        {
            return new List<string>();
        }

        try
        {
            var references = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, List<string>>>(resourceReferences);
            return references != null && references.TryGetValue(ToolsReferenceKey, out var tools) && tools != null
                ? tools
                : new List<string>();
        }
        catch (System.Text.Json.JsonException)
        {
            return null;
        }
    }

    /// <summary>
    /// Picks the tool a publish resolves a name to: current space, then Central, then other spaces, oldest first.
    /// </summary>
    public static Tool? PickResolvedTool(IEnumerable<Tool> candidates, Guid? targetSpaceId)
    {
        return candidates
            .OrderBy(w => w.SpaceId == targetSpaceId ? 0 : (w.SpaceId == null ? 1 : 2))
            .ThenBy(w => w.CreatedOn)
            .ThenBy(w => w.Id)
            .FirstOrDefault();
    }

    /// <summary>
    /// Combines a count with its singular noun, pluralizing when needed.
    /// </summary>
    public static string Pluralize(int count, string singular)
    {
        return $"{count} {singular}{(count == 1 ? string.Empty : "s")}";
    }
}
