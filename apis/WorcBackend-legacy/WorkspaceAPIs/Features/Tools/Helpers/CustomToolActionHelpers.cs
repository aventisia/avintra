namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// One candidate produced when splitting a custom-tool action / node name
/// (<c>CustomTool/{toolName}.{operationId}</c>) at one of its dots.
/// <see cref="ToolId"/> is set when the tool-name portion is a GUID (legacy flows
/// saved before the tool-name convention), otherwise <see cref="Guid.Empty"/>.
/// </summary>
public readonly record struct CustomToolActionCandidate(string ToolName, Guid ToolId, string OperationId);

/// <summary>
/// Shared parsing/resolution for the custom-tool action reference
/// <c>{toolName}.{operationId}</c> (optionally carrying the <c>CustomTool/</c>
/// node-name prefix and a <c>.json</c> suffix).
///
/// Tool names are user-controlled and may themselves contain dots, so the split
/// is ambiguous: the reference is split at every dot and candidates are yielded
/// longest-tool-name-first (rightmost dot first); consumers resolve candidates
/// against the database and take the first that matches a real tool. The legacy
/// <c>{toolId}.{operationId}</c> GUID form is still accepted.
/// </summary>
public static class CustomToolActionHelpers
{
    /// <summary>
    /// Splits a custom-tool reference into candidate (tool, operationId) pairs,
    /// ordered longest-tool-name-first. Returns an empty sequence when the
    /// reference carries no usable dot separator.
    /// </summary>
    public static IEnumerable<CustomToolActionCandidate> SplitActionCandidates(string? reference)
    {
        if (string.IsNullOrWhiteSpace(reference))
        {
            yield break;
        }

        var value = reference.Trim();
        if (value.EndsWith(".json", StringComparison.OrdinalIgnoreCase))
        {
            value = value[..^".json".Length];
        }

        // Node-name form: strip the "CustomTool/" keyword prefix — but only when the
        // keyword is followed by a separator, so tool names that merely start with
        // "CustomTool…" are preserved. Bare "{tool}.{operationId}" references (the
        // invoke action) are also accepted.
        if (value.StartsWith("CustomTool", StringComparison.OrdinalIgnoreCase) &&
            value.Length > "CustomTool".Length &&
            (value["CustomTool".Length] is '/' or '_'))
        {
            value = value["CustomTool".Length..].TrimStart('/', '_');
        }

        for (var separatorIndex = value.LastIndexOf('.');
             separatorIndex > 0;
             separatorIndex = value.LastIndexOf('.', separatorIndex - 1))
        {
            var operationId = value[(separatorIndex + 1)..];
            if (operationId.Length == 0)
            {
                continue;
            }

            var toolName = value[..separatorIndex];
            Guid.TryParse(toolName, out var toolId);
            yield return new CustomToolActionCandidate(toolName, toolId, operationId);
        }
    }

    /// <summary>
    /// Resolves the custom tool referenced by a <c>{toolName}.{operationId}</c>
    /// action within the current tenant/environment, trying each split candidate
    /// (name first, then the legacy GUID form) until one matches.
    /// </summary>
    public static async Task<(Tool? Tool, string OperationId)> ResolveToolAsync(
        IToolRepo toolRepo,
        ICurrentTenantService currentTenantService,
        string? reference)
    {
        foreach (var candidate in SplitActionCandidates(reference))
        {
            // Current convention: the tool-name portion.
            var tool = await toolRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == candidate.ToolName.ToLower() &&
                    w.Type == ComponentTypeEnum.Custom &&
                    w.TenantId == currentTenantService.CurrentTenantId &&
                    w.EnvType == currentTenantService.CurrentEnvType)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // Legacy fallback: flows saved while the action carried the tool GUID.
            if (tool is null && candidate.ToolId != Guid.Empty)
            {
                tool = await toolRepo
                    .GetByConditionAsync(w =>
                        w.Id == candidate.ToolId &&
                        w.Type == ComponentTypeEnum.Custom &&
                        w.TenantId == currentTenantService.CurrentTenantId &&
                        w.EnvType == currentTenantService.CurrentEnvType)
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync();
            }

            if (tool is not null)
            {
                return (tool, candidate.OperationId);
            }
        }

        return (null, string.Empty);
    }
}