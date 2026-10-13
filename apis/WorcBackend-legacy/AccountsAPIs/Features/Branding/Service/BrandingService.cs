namespace AccountsAPIs.Services;

public class BrandingService : IBrandingService
{
    private readonly EnvironmentConfig _environmentConfig;

    public BrandingService(EnvironmentConfig environmentConfig)
    {
        _environmentConfig = environmentConfig;
    }

    // Retrieves the deployment branding configuration.
    public Task<ServiceResponse<BrandingDto>> GetBrandingAsync()
    {
        // Initialize default failure response
        var serviceResponse = ServiceResponse<BrandingDto>.Create("Failed to retrieve deployment branding.", 500);

        // Community deployments keep the built-in Avintra branding; customization applies to
        // Enterprise and Commercial only.
        if (_environmentConfig.IsCommunityDeployment)
        {
            return Task.FromResult(serviceResponse.Update(null, 200, new BrandingDto()));
        }

        // Build the branding from the deployment environment; unset values stay null so the
        // client falls back to its built-in defaults.
        var brandingDto = new BrandingDto
        {
            AppName = _environmentConfig.BrandingAppName,
            CompanyName = _environmentConfig.BrandingCompanyName,
            LogoUrl = _environmentConfig.BrandingLogoUrl,
            LogoUrlDark = _environmentConfig.BrandingLogoUrlDark,
            FullLogoUrl = _environmentConfig.BrandingFullLogoUrl,
            FaviconUrl = _environmentConfig.BrandingFaviconUrl,
            PrimaryColor = _environmentConfig.BrandingPrimaryColor,
            SecondaryColor = _environmentConfig.BrandingSecondaryColor,
        };

        return Task.FromResult(serviceResponse.Update(null, 200, brandingDto));
    }
}
