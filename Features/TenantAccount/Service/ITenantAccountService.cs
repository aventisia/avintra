namespace AccountsAPIs.Services;

public interface ITenantAccountService
{
    // acccounts-api/tenant/user/
    Task<ServiceResponse<GetUserTenantInfoDto>> GetTenantUserInfoAsync();

    // acccounts-api/tenant/users/
    // acccounts-api/tenant/add-user/
    // acccounts-api/tenant/add-users/
    // acccounts-api/tenant/update-user/
    // acccounts-api/tenant/delete-user/
}