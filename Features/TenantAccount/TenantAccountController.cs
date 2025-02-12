namespace AccountsAPIs.Controllers;

[Route("tenant-account"), ApiController, Authorize]
public class TenantAccountController : BaseApiController
{
    private readonly ITenantAccountService _tenantAccountService;

    public TenantAccountController(ITenantAccountService tenantAccountService)
    {
        _tenantAccountService = tenantAccountService;
    }

    // acccounts-api/tenant/user/
    // [HttpGet("user")]
    // public async Task<ActionResult<ServiceResponse<UpdateUserProfileDto>>> GetTenantUser(UpdateUserProfileDto updateUserProfileDto)
    // {
    //     return ResultHelper(await _tenantAccountService.GetTenantUserAsync());
    // }
    // acccounts-api/tenant/users/
    // acccounts-api/tenant/add-user/
    // acccounts-api/tenant/add-users/
    // acccounts-api/tenant/update-user/
    // acccounts-api/tenant/delete-user/
}