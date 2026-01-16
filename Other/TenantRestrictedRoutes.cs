namespace AspNetToolkit.Other;

public static class TenantAccessRestrictions
{
    // Dictionary mapping tenant types to the list of routes they are not allowed to access.
    // The key is the tenant type (e.g., Enterprise), and the value is a list of restricted API routes.
    public static readonly Dictionary<OnPremTenantTypesEnum, List<string>> RestrictedRoutes = new()
    {
        {
            // Enterprise tenants are restricted from accessing the audit logs API
            OnPremTenantTypesEnum.Enterprise, new List<string>
            {
                // TODO: Add URLs of restricted routes (e.g., "/tenant/audit-logs", "/tenant/admin-settings")
            }
        }
    };
}
