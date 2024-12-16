namespace AccountsAPIs.Services;

public class CustomRoleService : ICustomRoleService
{
    private readonly ILogger<CustomRoleService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public CustomRoleService(
        ILogger<CustomRoleService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    //Get list of roles
    public async Task<ServiceResponse<IEnumerable<CustomRoleDto>>> GetCustomRoleListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<CustomRoleDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get custom roles
            var customRoles = await _unitOfWork.CustomRoleRepo
            .GetByConditionAsync(s => s.IsDisabled == false)
            .OrderByDescending(o => o.Id).ToListAsync();

            // Task successful
            serviceResponse.Data = customRoles.Adapt<IEnumerable<CustomRoleDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Roles retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a custom role
    public async Task<ServiceResponse<CustomRoleDto>> InsertCustomRoleAsync(CustomRoleDto customRoleDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<CustomRoleDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newRole = customRoleDto.Adapt<CustomRole>();
            newRole.CreatedByUserId = _userId;
            newRole.LastModifiedByUserId = _userId;

            //Insert a role
            await _unitOfWork.CustomRoleRepo.InsertAsync(newRole);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new role.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newRole.Adapt<CustomRoleDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates a role
    public async Task<ServiceResponse<CustomRoleDto>> UpdateCustomRoleAsync(CustomRoleDto customRoleDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<CustomRoleDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate role existence
            var role = await _unitOfWork.CustomRoleRepo
                .GetByConditionAsync(r => r.Id == customRoleDto.Id)
                .SingleOrDefaultAsync();

            // Role does not exist
            if (role == null)
            {
                _logger.LogInformation($"Role does not exist");
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newRole = customRoleDto.Adapt(role);

            //create an updated role
            _unitOfWork.CustomRoleRepo.Update(newRole);
            newRole.CreatedByUserId = _userId;
            newRole.LastModifiedByUserId = _userId;

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating role.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newRole.Adapt<CustomRoleDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }


    //Deletes a role
    public async Task<ServiceResponse<bool>> DeleteCustomeRoleAsync(Guid id)
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
            var role = await _unitOfWork.CustomRoleRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if role not exists
            if (role == null)
            {
                _logger.LogInformation($"Role does not exist");
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            //Delete role
            _unitOfWork.CustomRoleRepo.Delete(role);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting a role.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role deleted successfully";

        }
        catch(Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    
}