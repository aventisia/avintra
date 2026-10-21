namespace WorkspaceAPIs.Helpers;

public static class ResourceFlowAccessHelpers
{
    private const string ToolsReferenceKey = "tools";
    private const string QueuesReferenceKey = "queues";
    private const string KeyStoresReferenceKey = "keyStores";

    /// <summary>
    /// Reads the referenced tool names stored in the publish snapshot. Returns null when the snapshot is not valid JSON.
    /// </summary>
    public static List<string>? TryReadReferencedToolNames(string? resourceReferences)
    {
        return TryReadReferencedNames(resourceReferences, ToolsReferenceKey);
    }

    /// <summary>
    /// Reads the referenced queue names stored in the publish snapshot. Returns null when the snapshot is not valid JSON.
    /// </summary>
    public static List<string>? TryReadReferencedQueueNames(string? resourceReferences)
    {
        return TryReadReferencedNames(resourceReferences, QueuesReferenceKey);
    }

    /// <summary>
    /// Reads the referenced key store names stored in the publish snapshot. Returns null when the snapshot is not valid JSON.
    /// </summary>
    public static List<string>? TryReadReferencedKeyStoreNames(string? resourceReferences)
    {
        return TryReadReferencedNames(resourceReferences, KeyStoresReferenceKey);
    }

    /// <summary>
    /// Picks the resource a publish resolves a name to: current space, then Central, then other spaces, oldest first.
    /// </summary>
    public static T? PickResolved<T>(IEnumerable<T> candidates, Guid? targetSpaceId, Func<T, Guid?> spaceSelector, Func<T, DateTimeOffset> createdOnSelector, Func<T, Guid> idSelector)
    {
        return candidates
            .OrderBy(w => spaceSelector(w) == targetSpaceId ? 0 : (spaceSelector(w) == null ? 1 : 2))
            .ThenBy(w => createdOnSelector(w))
            .ThenBy(w => idSelector(w))
            .FirstOrDefault();
    }

    /// <summary>
    /// Picks the tool a publish resolves a name to: current space, then Central, then other spaces, oldest first.
    /// </summary>
    public static Tool? PickResolvedTool(IEnumerable<Tool> candidates, Guid? targetSpaceId)
    {
        return PickResolved(candidates, targetSpaceId, w => w.SpaceId, w => w.CreatedOn, w => w.Id);
    }

    /// <summary>
    /// Picks the queue a publish resolves a name to: current space, then Central, then other spaces, oldest first.
    /// </summary>
    public static Queue? PickResolvedQueue(IEnumerable<Queue> candidates, Guid? targetSpaceId)
    {
        return PickResolved(candidates, targetSpaceId, w => w.SpaceId, w => w.CreatedOn, w => w.Id);
    }

    /// <summary>
    /// Picks the key store a publish resolves a name to: current space, then Central, then other spaces, oldest first.
    /// </summary>
    public static KeyStore? PickResolvedKeyStore(IEnumerable<KeyStore> candidates, Guid? targetSpaceId)
    {
        return PickResolved(candidates, targetSpaceId, w => w.SpaceId, w => w.CreatedOn, w => w.Id);
    }

    /// <summary>
    /// Combines a count with its singular noun, pluralizing when needed.
    /// </summary>
    public static string Pluralize(int count, string singular)
    {
        return $"{count} {singular}{(count == 1 ? string.Empty : "s")}";
    }

    private static List<string>? TryReadReferencedNames(string? resourceReferences, string referenceKey)
    {
        if (string.IsNullOrWhiteSpace(resourceReferences))
        {
            return new List<string>();
        }

        try
        {
            var references = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, List<string>>>(resourceReferences);
            return references != null && references.TryGetValue(referenceKey, out var names) && names != null
                ? names
                : new List<string>();
        }
        catch (System.Text.Json.JsonException)
        {
            return null;
        }
    }
}
