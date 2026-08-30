namespace AccountsAPIs.Services;

public class RolePermissionService : IRolePermissionService
{
    private readonly ILogger<RolePermissionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public RolePermissionService(
        ILogger<RolePermissionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    //Get list of role permissions
    public async Task<ServiceResponse<IEnumerable<RolePermissionDto>>> GetRolePermissionListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<RolePermissionDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get role permissions
            var rolePermissions = await _unitOfWork.RolePermissionRepo
            .GetByConditionAsync(s => s.IsDisabled == false)
            .OrderByDescending(o => o.Id).ToListAsync();

            // Task successful
            serviceResponse.Data = rolePermissions.Adapt<IEnumerable<RolePermissionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role permissions retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve role-permission list.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a role permission
    public async Task<ServiceResponse<RolePermissionDto>> InsertRolePermissionAsync(RolePermissionDto rolePermissionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<RolePermissionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newRolePermission = rolePermissionDto.Adapt<RolePermission>();
            newRolePermission.CreatedByUserId = _userId;
            newRolePermission.LastModifiedByUserId = _userId;

            //Insert a role permission
            await _unitOfWork.RolePermissionRepo.InsertAsync(newRolePermission);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newRolePermission.Adapt<RolePermissionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role permission added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert role-permission.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates a role permission
    public async Task<ServiceResponse<RolePermissionDto>> UpdateRolePermissionAsync(RolePermissionDto rolePermissionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<RolePermissionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate role permission existence
            var rolePermission = await _unitOfWork.RolePermissionRepo
                .GetByConditionAsync(r => r.Id == rolePermissionDto.Id)
                .SingleOrDefaultAsync();

            // Role Permission does not exist
            if (rolePermission == null)
            {
                serviceResponse.Message = "Role permission does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newRolePermission = rolePermissionDto.Adapt(rolePermission);

            //create an updated role
            _unitOfWork.RolePermissionRepo.Update(newRolePermission);
            newRolePermission.CreatedByUserId = _userId;
            newRolePermission.LastModifiedByUserId = _userId;

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newRolePermission.Adapt<RolePermissionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role permission updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update role-permission.");
            return serviceResponse;
        }
        return serviceResponse;
    }


    //Deletes a role permission
    public async Task<ServiceResponse<bool>> DeleteRolePermissionAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get permission using identifier
            var rolePermission = await _unitOfWork.RolePermissionRepo
            .GetByConditionAsync(p => p.Id == id)
            .SingleOrDefaultAsync();

            //Check if role permission not exists
            if (rolePermission == null)
            {
                serviceResponse.Message = "Role permission does not exist";
                return serviceResponse;
            }

            //Delete a role permission
            _unitOfWork.RolePermissionRepo.Delete(rolePermission);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role permission deleted successfully";

        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Failed to delete role-permission {RolePermissionId}.", id);
            return serviceResponse;
        }
        return serviceResponse;
    }

    
}
