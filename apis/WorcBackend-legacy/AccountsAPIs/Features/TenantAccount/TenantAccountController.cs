namespace AccountsAPIs.Controllers;

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
    [HttpGet("detail")]
    public async Task<ActionResult<ServiceResponse<TenantOrganizationBillingDto>>> GetTenantOrganizationDetails()
    {
        return ResultHelper(await _tenantAccountService.GetTenantOrganizationAsync());
    }

    // Updates the tenant's organization details based on the provided data.
    [HttpPut("detail")]
    public async Task<ActionResult<ServiceResponse<TenantOrganizationBillingDto>>> UpdateTenantOrganizationDetails(TenantOrganizationBillingDto tenantOrganizationBillingDto)
    {
        return ResultHelper(await _tenantAccountService.UpdateTenantOrganizationAsync(tenantOrganizationBillingDto));
    }

    // Retrieves the current preferences of the tenant.
    [HttpGet("preferences")]
    public async Task<ActionResult<ServiceResponse<TenantPreferenceDto>>> GetTenantPreferences()
    {
        return ResultHelper(await _tenantAccountService.GetTenantPreferencesAsync());
    }

    // Updates the tenant's preferences based on the provided data.
    [HttpPut("preferences")]
    public async Task<ActionResult<ServiceResponse<TenantPreferenceDto>>> UpdateTenantPreferences(TenantPreferenceDto tenantPreferenceDto)
    {
        return ResultHelper(await _tenantAccountService.UpdateTenantPreferencesAsync(tenantPreferenceDto));
    }

    // Searches for account users matching the specified search key.
    [HttpGet("users/search/{searchKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AppUserBaseDto>>>> SearchAccountUser(string searchKey, [FromQuery] bool includeCurrentUser = false)
    {
        return ResultHelper(await _tenantAccountService.SearchAccountUserAsync(searchKey, includeCurrentUser));
    }
}