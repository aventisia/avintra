namespace AspNetToolkit.Enums;

/// <summary>
/// Maps the fixed developer roles to the platform app whose user management lists them.
/// CRM placeholder roles belong to the CRM app; all other fixed roles belong to workspace.
/// </summary>
public static class PlatformAppRoleMap
{
    public static PlatformAppsEnum ToPlatformApp(this CustomRolesEnum role)
    {
        return role switch
        {
            CustomRolesEnum.CSA or CustomRolesEnum.CTA or CustomRolesEnum.CSR or CustomRolesEnum.CRP => PlatformAppsEnum.CRM,
            _ => PlatformAppsEnum.Workspace,
        };
    }
}
