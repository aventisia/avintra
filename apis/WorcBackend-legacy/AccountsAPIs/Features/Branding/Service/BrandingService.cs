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
        // Enterprise and Commercial only unless GlobalAdmin explicitly allows it.
        if (!_environmentConfig.IsBrandingAllowedForDeployment)
        {
            return Task.FromResult(serviceResponse.Update(null, 200, new BrandingDto()));
        }

        // Build the branding from the deployment environment; unset values stay null so the
        // client falls back to its built-in defaults.
        var brandingDto = new BrandingDto
        {
            AppName = _environmentConfig.BrandingAppName,
            CompanyName = _environmentConfig.BrandingCompanyName,
            CompanyLogoUrlLight = _environmentConfig.BrandingCompanyLogoUrlLight,
            CompanyLogoUrlDark = _environmentConfig.BrandingCompanyLogoUrlDark,
            ProductLogoUrlLight = _environmentConfig.BrandingProductLogoUrlLight,
            ProductLogoUrlDark = _environmentConfig.BrandingProductLogoUrlDark,
            ShortLogoUrlLight = _environmentConfig.BrandingShortLogoUrlLight,
            ShortLogoUrlDark = _environmentConfig.BrandingShortLogoUrlDark,
            FaviconUrlLight = _environmentConfig.BrandingFaviconUrlLight,
            FaviconUrlDark = _environmentConfig.BrandingFaviconUrlDark,
            BackgroundColor = _environmentConfig.BrandingBackgroundColor,
            ForegroundColor = _environmentConfig.BrandingForegroundColor,
            PrimaryColor = _environmentConfig.BrandingPrimaryColor,
            PrimaryForegroundColor = _environmentConfig.BrandingPrimaryForegroundColor,
            SecondaryColor = _environmentConfig.BrandingSecondaryColor,
            SecondaryForegroundColor = _environmentConfig.BrandingSecondaryForegroundColor,
            AccentColor = _environmentConfig.BrandingAccentColor,
            AccentForegroundColor = _environmentConfig.BrandingAccentForegroundColor,
        };

        return Task.FromResult(serviceResponse.Update(null, 200, brandingDto));
    }
}
