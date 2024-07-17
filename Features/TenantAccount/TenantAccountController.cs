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
}