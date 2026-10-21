namespace WorkspaceAPIs.Helpers;

public static class ResourceFlowAccessHelpers
{
    private const string ToolsReferenceKey = "tools";
    private const string QueuesReferenceKey = "queues";
    private const string SkillsReferenceKey = "skills";
    private const string KnowledgeBasesReferenceKey = "knowledgeBases";
    private const string CredentialsReferenceKey = "credentials";

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
    /// Reads the referenced skill names stored in the publish snapshot. Returns null when the snapshot is not valid JSON.
    /// </summary>
    public static List<string>? TryReadReferencedSkillNames(string? resourceReferences)
    {
        return TryReadReferencedNames(resourceReferences, SkillsReferenceKey);
    }

    /// <summary>
    /// Reads the referenced knowledge base names stored in the publish snapshot. Returns null when the snapshot is not valid JSON.
    /// </summary>
    public static List<string>? TryReadReferencedKnowledgeBaseNames(string? resourceReferences)
    {
        return TryReadReferencedNames(resourceReferences, KnowledgeBasesReferenceKey);
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
    /// Picks the knowledge base a publish resolves a name to: current space, then Central, then other spaces, oldest first.
    /// </summary>
    public static KnowledgeBase? PickResolvedKnowledgeBase(IEnumerable<KnowledgeBase> candidates, Guid? targetSpaceId)
    {
        return PickResolved(candidates, targetSpaceId, w => w.SpaceId, w => w.CreatedOn, w => w.Id);
    }

    private static T? PickResolved<T>(IEnumerable<T> candidates, Guid? targetSpaceId, Func<T, Guid?> spaceOf, Func<T, DateTimeOffset> createdOf, Func<T, Guid> idOf)
    {
        return candidates
            .OrderBy(w => spaceOf(w) == targetSpaceId ? 0 : (spaceOf(w) == null ? 1 : 2))
            .ThenBy(w => createdOf(w))
            .ThenBy(w => idOf(w))
            .FirstOrDefault();
    }

    /// <summary>
    /// Picks the skill a publish resolves a name to: current space, then Central, then other spaces, oldest first.
    /// </summary>
    public static Skill? PickResolvedSkill(IEnumerable<Skill> candidates, Guid? targetSpaceId)
    {
        return PickResolved(candidates, targetSpaceId, w => w.SpaceId, w => w.CreatedOn, w => w.Id);
    }

    /// <summary>
    /// Reads the referenced credential names stored in the publish snapshot. Returns null when the snapshot is not valid JSON.
    /// </summary>
    public static List<string>? TryReadReferencedCredentialNames(string? resourceReferences)
    {
        return TryReadReferencedNames(resourceReferences, CredentialsReferenceKey);
    }

    /// <summary>
    /// Picks the credential a publish resolves a name to: current space, then Central, then other spaces, oldest first.
    /// </summary>
    public static VaultCredential? PickResolvedCredential(IEnumerable<VaultCredential> candidates, Guid? targetSpaceId)
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
