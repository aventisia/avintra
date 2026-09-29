namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Reads knowledge-base and environment scoping out of <see cref="VectorStore.Metadata"/>.
/// Vectors are linked to a knowledge base by the kb_name stored in Metadata (there is no foreign
/// key), and scoped to an environment by Metadata.env_type.
/// </summary>
public static class VectorStoreMetadataHelpers
{
    /// <summary>
    /// Gets the deployment environment a vector belongs to, read from Metadata.env_type.
    /// Vectors written before environment scoping existed have no env_type and default to "dev".
    /// </summary>
    public static string GetEnvType(VectorStore vectorStore)
    {
        if (vectorStore.Metadata?.RootElement.ValueKind == JsonValueKind.Object &&
            vectorStore.Metadata.RootElement.TryGetProperty("env_type", out var envElement))
        {
            var envType = envElement.GetString();
            if (!string.IsNullOrWhiteSpace(envType))
                return envType.Trim().ToLowerInvariant();
        }

        return "dev";
    }

    /// <summary>
    /// Returns true when the vector's Metadata.kb_name matches the supplied knowledge base name.
    /// </summary>
    public static bool IsForKnowledgeBase(VectorStore vectorStore, string kbName)
    {
        if (vectorStore.Metadata?.RootElement.ValueKind != JsonValueKind.Object)
            return false;

        if (!vectorStore.Metadata.RootElement.TryGetProperty("kb_name", out var kbNameElement))
            return false;

        var metadataKbName = kbNameElement.GetString();
        return !string.IsNullOrWhiteSpace(metadataKbName)
            && !string.IsNullOrWhiteSpace(kbName)
            && string.Equals(metadataKbName, kbName, StringComparison.OrdinalIgnoreCase);
    }
}
