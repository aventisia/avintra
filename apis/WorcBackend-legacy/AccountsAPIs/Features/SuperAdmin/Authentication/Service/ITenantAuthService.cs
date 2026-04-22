namespace AccountsAPIs.Services;

public interface ITenantAuthService
{
    /// <summary>
    /// Generates an access token for a tenant.
    /// TenantId is resolved internally from the request context (e.g., X-Tenant-Id header).
    /// </summary>
    /// <returns>A task containing the user session.</returns>
    Task<ServiceResponse<UserSessionDto>> GenerateTenantTokenAsync(TenantTokenDto tenantTokenDto);
}