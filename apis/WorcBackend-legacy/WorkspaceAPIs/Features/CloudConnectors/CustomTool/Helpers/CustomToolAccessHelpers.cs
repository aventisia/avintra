namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;

/// <summary>
/// Authorization checks for custom-tool invocation.
/// </summary>
public static class CustomToolAccessHelpers
{
    /// <summary>
    /// Indicates whether a user may use a resolved custom tool.
    /// </summary>
    public static async Task<bool> CanUseToolAsync(
        IResourceUserAccessService resourceUserAccessService,
        Guid userId,
        Tool tool)
    {
        if (tool.IsTenantWideAccess || tool.CreatedByUserId == userId)
        {
            return true;
        }

        var (hasAccess, _) = await resourceUserAccessService.GetResourceAccessAsync(
            userId,
            tool.Id,
            ResourceTypeEnum.Tool,
            tool.CreatedByUserId ?? Guid.Empty,
            false,
            ResourceAccessTypeEnum.Owner,
            ResourceAccessTypeEnum.View,
            ResourceAccessTypeEnum.Edit);

        return hasAccess;
    }
}
