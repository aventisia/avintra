using System.Net;

namespace AccountsAPIs.Services;

public class TenantAccountService(ILogger<TenantAccountService> logger,IUnitOfWork unitOfWork) : ITenantAccountService
{
    // acccounts-api/tenant/user/
    // acccounts-api/tenant/update-user/
    // acccounts-api/tenant/users/
    // acccounts-api/tenant/add-user/
    // acccounts-api/tenant/add-users/
    // acccounts-api/tenant/delete-user/
}