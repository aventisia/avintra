namespace AccountsAPIs.Services;

public class TenantAccountService(
    ILogger<TenantAccountService> logger,
    UserManager<AccountUser> userManager,
    IHttpContextAccessor httpContextAccessor,
    IUnitOfWork unitOfWork) : ITenantAccountService
{
    private readonly ILogger<TenantAccountService> _logger = logger;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly string _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
    private readonly UserManager<AccountUser> _userManager = userManager;
    const string userDoesNotExists = "User does not exists";
    const string userNotFoundTemplate = "{methodName}: User not found for username {_userName}";


    // acccounts-api/tenant/user/
    public async Task<ServiceResponse<GetUserTenantInfoDto>> GetTenantUserInfoAsync()
    {
        //Initialize ServiceResponse with Failed response
        var serviceResponse = new ServiceResponse<GetUserTenantInfoDto>()
        {
            Data = null,
            Message = "Failed to update your profile. Please try again later"
        };

        try
        {
            //set method name
            var methodName = nameof(GetTenantUserInfoAsync);

            // Get user
            var user = await _userManager.FindByNameAsync(_userName);

            // User doesn't exist
            if (user == null)
            {
                _logger.LogInformation(userNotFoundTemplate, methodName, _userName);
                serviceResponse.Message = userDoesNotExists;
                return serviceResponse;
            }

            // Decide tenant name basis "@aventisia.com"
            var tenantName = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(user.Email) == "aventisia.com"
                                ? GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.Aventisia)
                                : GetEnumDescriptionUtil.GetEnumDescription(DefaultTenantsEnum.IndividualUsers);

            // Get default Tenant 
            var defaultTenant = await _unitOfWork.TenantRepo
                                        .GetByConditionAsync(w => w.IsDefault && w.Name == tenantName)
                                        .SingleOrDefaultAsync();

            GetUserTenantInfoDto getUserTenantInfoDto;
            if (defaultTenant is null)
            {
                //if the use is individual then get the billing address of the user
                _logger.LogInformation("{_UserName} user is individual", _userName);
                getUserTenantInfoDto = new() { IsIndividual = true };
            }
            else
            {
                var addressOfTenant = await _unitOfWork.AddressRepo
                .GetByConditionAsync(a => a.AddressRefId == defaultTenant.Id)
                .FirstOrDefaultAsync();
                getUserTenantInfoDto = new()
                {
                    IsIndividual = false,
                    AddressType = AddressType.Official,
                    AddressLine1 = addressOfTenant.AddressLine1,
                    AddressLine2 = addressOfTenant.AddressLine2,
                    City = addressOfTenant.City,
                    Country = addressOfTenant.Country,
                    StateOrProvince = addressOfTenant.StateOrProvince,
                    //TODO change when the designation when data is available
                    Designation = string.Empty,
                    TenantName = user.Tenant.Name
                };
            }
            serviceResponse.Message = "tenant info fetched succesfully.";
            serviceResponse.Data = getUserTenantInfoDto;
            serviceResponse.StatusCode = 200;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occured while performing {Name}", ex.TargetSite.Name);
            return serviceResponse;
        }
        return serviceResponse;
    }
    // acccounts-api/tenant/users/
    // acccounts-api/tenant/add-user/
    // acccounts-api/tenant/add-users/
    // acccounts-api/tenant/update-user/
    // acccounts-api/tenant/delete-user/
}