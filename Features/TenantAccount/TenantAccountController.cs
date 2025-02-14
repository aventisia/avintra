namespace AccountsAPIs.Controllers;

[Route("tenant-account"), ApiController, Authorize]
public class TenantAccountController(ITenantAccountService tenantAccountService) : BaseApiController
{
    private readonly ITenantAccountService _tenantAccountService = tenantAccountService;

    // acccounts-api/tenant/user/
    [HttpGet("user")]
    public async Task<ActionResult<ServiceResponse<GetUserTenantInfoDto>>> GetTenantUserInfo()
    {
        return ResultHelper(await _tenantAccountService.GetTenantUserInfoAsync());
    }

    
    // acccounts-api/tenant/users/
    // acccounts-api/tenant/add-user/
    // acccounts-api/tenant/add-users/
    // acccounts-api/tenant/update-user/
    // acccounts-api/tenant/delete-user/
}