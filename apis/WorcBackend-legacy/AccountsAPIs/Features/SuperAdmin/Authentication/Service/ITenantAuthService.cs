namespace AccountsAPIs.Services;

public interface ITenantAuthService
{
    /// <summary>
    /// Creates a tenant-scoped session by allowing a Super Admin to access a specific tenant.
    /// Issues access and refresh tokens for the selected tenant context.
    /// </summary>
    Task<ServiceResponse<UserSessionDto>> CreateSessionAsync();

    /// <summary>
    /// Refreshes an existing session using a valid refresh token.
    /// </summary>
    Task<ServiceResponse<UserSessionDto>> RefreshSessionAsync();
}