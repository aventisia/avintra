namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// One candidate produced when splitting a custom-tool action reference at one of its dots.
/// </summary>
public readonly record struct CustomToolActionCandidate(string ToolName, Guid ToolId, string OperationId);

/// <summary>
/// Parses and resolves the custom-tool action reference <c>{toolName}.{operationId}</c> against the tool registry.
/// </summary>
public static class CustomToolActionHelpers
{
    /// <summary>
    /// Splits a custom-tool reference into candidate <c>(tool, operationId)</c> pairs, ordered longest-tool-name-first.
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

        // IMPORTANT NOTE: the "CustomTool/" node-name prefix is only stripped when followed by a separator,
        // so tool names that merely start with "CustomTool" keep their leading segment.
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
    /// Resolves the custom tool referenced by a <c>{toolName}.{operationId}</c> action within the current tenant and environment.
    /// </summary>
    public static async Task<(Tool? Tool, string OperationId)> ResolveToolAsync(
        IToolRepo toolRepo,
        ICurrentTenantService currentTenantService,
        string? reference)
    {
        Guid? targetSpaceId = currentTenantService.CurrentSpaceId == Guid.Empty
            ? null
            : currentTenantService.CurrentSpaceId;

        foreach (var candidate in SplitActionCandidates(reference))
        {
            var namePattern = ToolNameMatchHelpers.ToExactMatchPattern(candidate.ToolName);
            var tool = await toolRepo
                .GetByConditionAsync(w =>
                    EF.Functions.ILike(w.Name, namePattern) &&
                    w.Type == ComponentTypeEnum.Custom &&
                    w.TenantId == currentTenantService.CurrentTenantId &&
                    w.EnvType == currentTenantService.CurrentEnvType &&
                    w.SpaceId == targetSpaceId)
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // IMPORTANT NOTE: flows saved before the tool-name convention stored the tool GUID in the action.
            if (tool is null && candidate.ToolId != Guid.Empty)
            {
                tool = await toolRepo
                    .GetByConditionAsync(w =>
                        w.Id == candidate.ToolId &&
                        w.Type == ComponentTypeEnum.Custom &&
                        w.TenantId == currentTenantService.CurrentTenantId &&
                        w.EnvType == currentTenantService.CurrentEnvType &&
                        w.SpaceId == targetSpaceId)
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
