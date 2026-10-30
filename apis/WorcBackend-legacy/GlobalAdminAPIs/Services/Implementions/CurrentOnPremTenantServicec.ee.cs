namespace GlobalAdminAPIs.Services;

public class CurrentOnPremTenantService : ICurrentOnPremTenantService
{
    // Property to keep tenantId for current request
    public Guid CurrentOnPremTenantId { get; set; }

    // Property to keep instanceId for current request (Required for global filtering in DbContext)
    public Guid CurrentOnPremInstanceId { get; set; }
}
