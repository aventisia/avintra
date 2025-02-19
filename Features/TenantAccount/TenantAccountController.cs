namespace AccountsAPIs.Controllers;

[Route("tenant-account"), ApiController, Authorize]
public class TenantAccountController(ITenantAccountService tenantAccountService) : BaseApiController
{
    // acccounts-api/tenant/user/
    // acccounts-api/tenant/update-user/
    // acccounts-api/tenant/users/
    // acccounts-api/tenant/add-user/
    // acccounts-api/tenant/add-users/
    // acccounts-api/tenant/delete-user/
}