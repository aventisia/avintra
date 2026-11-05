namespace WorkspaceAPIs.Features.Tools.Helpers;

/// <summary>
/// Maps a library catalog row to the unified tool shape. Platform tools carry no base URL,
/// activation, verification, or access columns, so those are fixed here.
/// </summary>
public static class ToolsHelpers
{
    /// <summary>
    /// Maps a platform tool to a <see cref="ToolDto"/> with the current tenant's active state.
    /// </summary>
    public static ToolDto ToToolDto(PlatformTool tool, bool isActive, bool includeSchema = true) => new()
    {
        Id = tool.Id,
        Name = tool.Name,
        Description = tool.Description,
        Type = ComponentTypeEnum.Platform,
        BaseUrl = string.Empty,
        OpenApiSpec = includeSchema ? tool.OpenApiSpec : null,
        ParsedSchema = includeSchema ? tool.ParsedSchema : null,
        IsTenantWideAccess = false,
        IsResourceAccessRestricted = true,
        IsActive = isActive,
        IsVerified = true,
        IsDisabled = tool.IsDisabled,
        IsPopular = tool.IsPopular,
        AccessLevel = ResourceAccessTypeEnum.View,
    };
}
