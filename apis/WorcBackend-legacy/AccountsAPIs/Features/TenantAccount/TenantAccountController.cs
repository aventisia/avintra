namespace AccountsAPIs.Controllers;

[Authorize]
[Route("tenant-account")]
[ApiController]
public class TenantAccountController : BaseApiController
{
    private readonly ITenantAccountService _tenantAccountService;

    public TenantAccountController(ITenantAccountService tenantAccountService)
    {
        _tenantAccountService = tenantAccountService;
    }

    // acccounts-api/tenant/user/
    // acccounts-api/tenant/users/
    // acccounts-api/tenant/add-user/
    // acccounts-api/tenant/add-users/
    // acccounts-api/tenant/update-user/
    // acccounts-api/tenant/delete-user/

    // Retrieves the current organization details of the tenant.
    [Authorize(Roles = "TA")]
    [HttpGet("detail")]
    public async Task<ActionResult<ServiceResponse<TenantOrganizationBillingDto>>> GetTenantOrganizationDetails()
    {
        return ResultHelper(await _tenantAccountService.GetTenantOrganizationAsync());
    }

    // Updates the tenant's organization details based on the provided data.
    [Authorize(Roles = "TA")]
    [HttpPut("detail")]
    public async Task<ActionResult<ServiceResponse<TenantOrganizationBillingDto>>> UpdateTenantOrganizationDetails(TenantOrganizationBillingDto tenantOrganizationBillingDto)
    {
        return ResultHelper(await _tenantAccountService.UpdateTenantOrganizationAsync(tenantOrganizationBillingDto));
    }

    // Retrieves the current preferences of the tenant.
    [Authorize(Roles = "TA")]
    [HttpGet("preferences")]
    public async Task<ActionResult<ServiceResponse<TenantPreferenceDto>>> GetTenantPreferences()
    {
        return ResultHelper(await _tenantAccountService.GetTenantPreferencesAsync());
    }

    // Updates the tenant's preferences based on the provided data.
    [Authorize(Roles = "TA")]
    [HttpPut("preferences")]
    public async Task<ActionResult<ServiceResponse<TenantPreferenceDto>>> UpdateTenantPreferences(TenantPreferenceDto tenantPreferenceDto)
    {
        return ResultHelper(await _tenantAccountService.UpdateTenantPreferencesAsync(tenantPreferenceDto));
    }

    // Enables or disables single sign-on for the tenant.
    [Authorize(Roles = "TA")]
    [HttpPut("sso/enabled")]
    public async Task<ActionResult<ServiceResponse<TenantPreferenceDto>>> UpdateTenantSsoState(TenantSsoStateDto tenantSsoStateDto)
    {
        return ResultHelper(await _tenantAccountService.UpdateTenantSsoStateAsync(tenantSsoStateDto));
    }

    // Generates the administrator consent URL for connecting the tenant's identity provider.
    [Authorize(Roles = "TA")]
    [HttpGet("sso/admin-consent-url")]
    public async Task<ActionResult<ServiceResponse<string>>> GetSsoAdminConsentUrl()
    {
        return ResultHelper(await _tenantAccountService.GetSsoAdminConsentUrlAsync());
    }

    // Binds the tenant granted by the identity provider to the tenant's single sign-on configuration.
    [Authorize(Roles = "TA")]
    [HttpGet("sso/admin-consent-callback")]
    public async Task<ActionResult<ServiceResponse<TenantPreferenceDto>>> CompleteSsoAdminConsent([FromQuery(Name = "tenant")] string grantedTenantId, [FromQuery] string? state)
    {
        return ResultHelper(await _tenantAccountService.CompleteSsoAdminConsentAsync(grantedTenantId, state));
    }

    // Retrieves the current automatic notification settings of the tenant.
    [Authorize(Roles = "TA")]
    [HttpGet("notification-settings")]
    public async Task<ActionResult<ServiceResponse<NotificationSettingsDto>>> GetNotificationSettings()
    {
        return ResultHelper(await _tenantAccountService.GetNotificationSettingsAsync());
    }

    // Updates the automatic notification settings of the tenant.
    [Authorize(Roles = "TA")]
    [HttpPut("notification-settings")]
    public async Task<ActionResult<ServiceResponse<NotificationSettingsDto>>> UpdateNotificationSettings(NotificationSettingsDto settingsDto)
    {
        return ResultHelper(await _tenantAccountService.UpdateNotificationSettingsAsync(settingsDto));
    }
}