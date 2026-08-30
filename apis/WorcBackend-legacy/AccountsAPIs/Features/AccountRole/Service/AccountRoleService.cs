namespace AccountsAPIs.Services;

public class AccountRoleService : IAccountRoleService
{
    private readonly ILogger<AccountRoleService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;


    public AccountRoleService(
        ILogger<AccountRoleService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    //Get list of roles
    public async Task<ServiceResponse<IEnumerable<AccountRoleDto>>> GetAccountRoleListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<AccountRoleDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get roles
            var roles = await _unitOfWork.AccountRoleRepo
            .GetByConditionAsync(s => s.IsDisabled == false)
            .OrderByDescending(o => o.Id).ToListAsync();

            // Task successful
            serviceResponse.Data = roles.Adapt<IEnumerable<AccountRoleDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Roles retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a role
    public async Task<ServiceResponse<AccountRoleDto>> InsertAccountRoleAsync(AccountRoleDto accountRoleDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AccountRoleDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get roles
            var roles = await _unitOfWork.AccountRoleRepo
            .GetAllAsync().ToListAsync();

            //Check for duplicate role
            if (roles.Any(r => r.FullName == accountRoleDto.FullName))
            {
                _logger.LogWarning("Role already exists, please select another role name.");
                serviceResponse.Message = "Role already exists, please select another role name.";
                return serviceResponse;
            }

            // Default mapping
            var newRole = accountRoleDto.Adapt<AccountRole>();
            newRole.CreatedByUserId = _userId;
            newRole.LastModifiedByUserId = _userId;

            //Insert a role
            await _unitOfWork.AccountRoleRepo.InsertAsync(newRole);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Context SaveChanges failed while inserting new role.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newRole.Adapt<AccountRoleDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates a role
    public async Task<ServiceResponse<AccountRoleDto>> UpdateAccountRoleAsync(AccountRoleDto accountRoleDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AccountRoleDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get roles
            var roles = await _unitOfWork.AccountRoleRepo
            .GetAllAsync().ToListAsync();

            //Check for duplicate role
            if (roles.Any(r => r.FullName == accountRoleDto.FullName))
            {
                _logger.LogWarning("Role already exists, please select another role name.");
                serviceResponse.Message = "Role already exists, please select another role name.";
                return serviceResponse;
            }

            // Validate role existence
            var role = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(r => r.Id == accountRoleDto.Id)
                .SingleOrDefaultAsync();

            // Role does not exist
            if (role == null)
            {
                _logger.LogWarning("Role does not exist");
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newRole = accountRoleDto.Adapt(role);

            //create an updated role
            _unitOfWork.AccountRoleRepo.Update(newRole);
            newRole.CreatedByUserId = _userId;
            newRole.LastModifiedByUserId = _userId;

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Context SaveChanges failed while updating role.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newRole.Adapt<AccountRoleDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            return serviceResponse;
        }
        return serviceResponse;
    }


    //Deletes a role
    public async Task<ServiceResponse<bool>> DeleteAccountRoleAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get role using identifier
            var role = await _unitOfWork.AccountRoleRepo
            .GetByConditionAsync(r => r.Id == id)
            .SingleOrDefaultAsync();

            //Check if role not exists
            if (role == null)
            {
                _logger.LogWarning("Role does not exist");
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            //Delete role
            _unitOfWork.AccountRoleRepo.Delete(role);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Context SaveChanges failed while deleting a role.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            return serviceResponse;
        }
        return serviceResponse;
    }

}