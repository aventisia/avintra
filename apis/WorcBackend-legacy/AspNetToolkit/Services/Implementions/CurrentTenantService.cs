/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/

using Microsoft.AspNetCore.Hosting;

namespace AspNetToolkit.Services;

public class CurrentTenantService : ICurrentTenantService
{
    private readonly TenantDbContext _tenantDbContext;
    private readonly IWebHostEnvironment _webHostEnvironment;

    public CurrentTenantService(
        TenantDbContext tenantDbContext,
        IWebHostEnvironment webHostEnvironment)
    {
        _tenantDbContext = tenantDbContext;
        _webHostEnvironment = webHostEnvironment;
    }

    // Validates tenant id with database and sets it into CurrentTenantId. If userId is
    // not Unknown then it also set the userId and set random Guid in CurrentUserId
    public async Task<string> SetTenantAndUser(string tenantId, string userId)
    {
        // Reset the current space to Central (Guid.Empty) for this request.
        // The TenantResolver middleware sets it from the X-Space-Id header / spid claim after this call.
        CurrentSpaceId = Guid.Empty;

        // Set CurrentUserId (It will be Unknown by default if user is not authenticated)
        if (userId.Equals("Unknown"))
            CurrentUserId = Guid.NewGuid();
        else
            CurrentUserId = Guid.Parse(userId);

        // TenantId not found
        if (string.IsNullOrWhiteSpace(tenantId)) return "Tenant id not found";

        // TenantlessEndpoint request. User also must be Unknown
        if (tenantId.Equals("TenantlessEndpoint"))
        {
            CurrentTenantId = Guid.Empty;
            return "pass";
        }

        // Set tenantId
        CurrentTenantId = Guid.Parse(tenantId);

        // Check if tenant exists
        var tenant = await _tenantDbContext.ReadOnlyTenants.Where(x => x.Id == Guid.Parse(tenantId)).SingleOrDefaultAsync();

        // Tenant not found
        if (tenant == null) return "Tenant not found";

        // Tenant is disabled
        if (tenant.IsDisabled) return "Tenant is disabled";

        // Tenant has expired
        if (tenant.ExpiresOn < DateTimeOffset.UtcNow) return "Tenant has expired";

        // set CurrentTenantId
        CurrentTenantId = tenant.Id;

        // Resolve container name for the tenant If a container name is already stored, reuse it
        // Otherwise, generate a new safe container name from the tenant name
        if (string.IsNullOrEmpty(tenant.ContainerName))
            CurrentTenantContainerName = TenantContainerUtil.GenerateName(tenant.Name);
        else
            CurrentTenantContainerName = tenant.ContainerName;

        // Return 
        return "pass";
    }

    // Prop to keep tenantId for current request
    public Guid CurrentTenantId { get; set; }

    // Prop to keep userId for current request. Required for global filter to apply in DbContext
    public Guid CurrentUserId { get; set; }

    // Prop to keep spaceId for current request. Guid.Empty = Central (shared across the tenant).
    public Guid CurrentSpaceId { get; set; }

    // Prop to keep the deployment environment for the current request.
    // Set by the TenantResolver middleware from the "X-Env-Type" header, defaulting to Dev.
    public ConfigureEnvironmentType CurrentEnvType { get; set; } = ConfigureEnvironmentType.Dev;

    // Container name associated with the current tenant.
    public required string CurrentTenantContainerName { get; set; }
}
