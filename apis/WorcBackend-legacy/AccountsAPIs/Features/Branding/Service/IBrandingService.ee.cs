namespace AccountsAPIs.Services;

public interface IBrandingService
{
    /// <summary>
    /// Retrieves the deployment branding configuration. A value is left null when its
    /// environment variable is not configured, letting the client fall back to defaults.
    /// </summary>
    /// <returns>A task representing the asynchronous operation, containing the branding configuration.</returns>
    Task<ServiceResponse<BrandingDto>> GetBrandingAsync();
}
