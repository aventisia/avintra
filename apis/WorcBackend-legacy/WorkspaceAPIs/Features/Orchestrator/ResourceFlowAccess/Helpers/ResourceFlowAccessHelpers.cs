using ExecutorLibrary.Models;

namespace WorkspaceAPIs.Helpers;

public static class ResourceFlowAccessHelpers
{
    private const string ToolsReferenceKey = "tools";
    private const string QueuesReferenceKey = "queues";
    private const string SkillsReferenceKey = "skills";
    private const string ConfigStoresReferenceKey = "configStores";
    private const string KnowledgeBasesReferenceKey = "knowledgeBases";
    private const string CredentialsReferenceKey = "credentials";

    /// <summary>
    /// Collects the resource names a flow graph references, keyed by resource type.
    /// All supported types are always present; unreferenced types hold an empty list.
    /// </summary>
    public static Dictionary<string, List<string>> CollectReferencedResourceNames(ReactFlowDataModel? flow)
    {
        var references = new Dictionary<string, List<string>>
        {
            [CredentialsReferenceKey] = new(),
            [QueuesReferenceKey] = new(),
            [KnowledgeBasesReferenceKey] = new(),
            [ToolsReferenceKey] = new(),
            [SkillsReferenceKey] = new(),
            [ConfigStoresReferenceKey] = new(),
        };

        if (flow?.Nodes is null)
        {
            return references;
        }

        foreach (var node in flow.Nodes)
        {
            if (node?.Data?.Inputs is null)
            {
                continue;
            }

            var configObj = new JsonObject();
            foreach (var input in node.Data.Inputs)
            {
                if (string.IsNullOrWhiteSpace(input.Key) || input.Value is null)
                {
                    continue;
                }
                configObj[input.Key] = input.Value is JsonElement je
                    ? JsonNode.Parse(je.GetRawText())
                    : JsonNode.Parse(System.Text.Json.JsonSerializer.Serialize(input.Value));
            }

            foreach (Match match in Regex.Matches(configObj.ToJsonString(), @"\{\{__config__([^}]+)\}\}", RegexOptions.IgnoreCase))
            {
                AddIfNotPresent(references[ConfigStoresReferenceKey], match.Groups[1].Value.Trim());
            }

            foreach (var kvp in configObj)
            {
                if (kvp.Key.Contains("__CredentialName__") && kvp.Value is not null)
                {
                    AddIfNotPresent(references[CredentialsReferenceKey], kvp.Value.ToString());
                }
            }

            foreach (var kvp in configObj)
            {
                if (!kvp.Key.Contains("__ModelConfig__") || kvp.Value is not JsonObject mc)
                {
                    continue;
                }
                var credId = ReadCredentialReference(mc);
                if (credId is not null && !IsEmptyCredential(credId))
                {
                    AddIfNotPresent(references[CredentialsReferenceKey], credId);
                }
            }

            foreach (var kvp in configObj)
            {
                if (!kvp.Key.Contains("__ToolsConfig__") || kvp.Value is not JsonArray toolsArr)
                {
                    continue;
                }
                foreach (var item in toolsArr)
                {
                    if (item is not JsonObject toolObj)
                    {
                        continue;
                    }
                    if (toolObj.TryGetPropertyValue("tool", out var toolNode) && toolNode is not null)
                    {
                        AddIfNotPresent(references[ToolsReferenceKey], toolNode.ToString());
                    }
                    var toolCred = ReadCredentialReference(toolObj);
                    if (toolCred is not null && !IsEmptyCredential(toolCred))
                    {
                        AddIfNotPresent(references[CredentialsReferenceKey], toolCred);
                    }
                }
            }

            foreach (var kvp in configObj)
            {
                if (!kvp.Key.Contains("__KbConfig__") || kvp.Value is not JsonObject kb)
                {
                    continue;
                }
                if (kb.TryGetPropertyValue("knowledgeBase", out var kbNode) && kbNode is JsonArray kbArr)
                {
                    foreach (var name in kbArr.Where(x => x is not null))
                    {
                        AddIfNotPresent(references[KnowledgeBasesReferenceKey], name!.ToString());
                    }
                }
            }

            foreach (var kvp in configObj)
            {
                if (!kvp.Key.Contains("__SkillsConfig__") || kvp.Value is not JsonObject sc)
                {
                    continue;
                }
                if (sc.TryGetPropertyValue("skills", out var skillsNode) && skillsNode is JsonArray skillsArr)
                {
                    foreach (var name in skillsArr.Where(x => x is not null))
                    {
                        AddIfNotPresent(references[SkillsReferenceKey], name!.ToString());
                    }
                }
            }

            foreach (var kvp in configObj)
            {
                if (kvp.Key.Equals("QueueName", StringComparison.OrdinalIgnoreCase) && kvp.Value is not null)
                {
                    AddIfNotPresent(references[QueuesReferenceKey], kvp.Value.ToString());
                }
            }
        }

        return references;
    }

    /// <summary>
    /// Reads the flow version identifier a called-agent or block node reference points at.
    /// </summary>
    public static bool TryExtractFlowVersionId(JsonElement? reference, out Guid flowVersionId)
    {
        flowVersionId = Guid.Empty;
        if (reference is null)
        {
            return false;
        }

        string? value = reference.Value.ValueKind switch
        {
            JsonValueKind.Object => reference.Value.TryGetProperty("id", out var idProperty) ? idProperty.GetString() : null,
            JsonValueKind.String => reference.Value.GetString(),
            _ => null,
        };

        return Guid.TryParse(value?.Trim(), out flowVersionId);
    }

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
    /// Reads the referenced config store names stored in the publish snapshot. Returns null when the snapshot is not valid JSON.
    /// </summary>
    public static List<string>? TryReadReferencedConfigStoreNames(string? resourceReferences)
    {
        return TryReadReferencedNames(resourceReferences, ConfigStoresReferenceKey);
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

    /// <summary>
    /// Picks the config store a publish resolves a name to: current space, then Central, then other spaces, oldest first.
    /// </summary>
    public static ConfigStore? PickResolvedConfigStore(IEnumerable<ConfigStore> candidates, Guid? targetSpaceId)
    {
        return PickResolved(candidates, targetSpaceId, w => w.SpaceId, w => w.CreatedOn, w => w.Id);
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

    private static bool IsEmptyCredential(string? value) =>
        string.IsNullOrWhiteSpace(value) ||
        value == "00000000-0000-0000-0000-000000000000";

    // Reads a credential reference from a config object. Accepts both the canonical
    // "credential_name" key and the legacy "credential_id" key (Q12 back-compat).
    private static string? ReadCredentialReference(JsonObject obj)
    {
        if (obj.TryGetPropertyValue("credential_name", out var nameNode) && nameNode is not null)
        {
            return nameNode.ToString();
        }
        if (obj.TryGetPropertyValue("credential_id", out var idNode) && idNode is not null)
        {
            return idNode.ToString();
        }
        return null;
    }

    private static void AddIfNotPresent(List<string> list, string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        if (!list.Contains(value, StringComparer.OrdinalIgnoreCase))
        {
            list.Add(value);
        }
    }
}
