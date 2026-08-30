namespace AccountsAPIs.Services;

public class PermissionService : IPermissionService
{
    private readonly ILogger<PermissionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly UserManager<AccountUser> _userManager;
    private readonly RoleManager<AccountRole> _roleManager;

    public PermissionService(
        ILogger<PermissionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        UserManager<AccountUser> userManager,
        RoleManager<AccountRole> roleManager)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    //Get list of permissions
    public async Task<ServiceResponse<IEnumerable<PermissionDto>>> GetPermissionListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<PermissionDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get permissions
            var permissions = await _unitOfWork.PermissionRepo
            .GetByConditionAsync(s => s.IsDisabled == false)
            .OrderByDescending(o => o.Id).ToListAsync();

            // Task successful
            serviceResponse.Data = permissions.Adapt<IEnumerable<PermissionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Permissions retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve permission list.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a permission
    public async Task<ServiceResponse<PermissionDto>> InsertPermissionAsync(PermissionDto permissionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<PermissionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newPermission = permissionDto.Adapt<AccountsAPIs.Entities.Permission>();
            newPermission.CreatedByUserId = _userId;
            newPermission.LastModifiedByUserId = _userId;

            //Insert a permission
            await _unitOfWork.PermissionRepo.InsertAsync(newPermission);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newPermission.Adapt<PermissionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Permission added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert permission.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates a permission
    public async Task<ServiceResponse<PermissionDto>> UpdatePermissionAsync(PermissionDto permissionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<PermissionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate permission existence
            var permission = await _unitOfWork.PermissionRepo
                .GetByConditionAsync(r => r.Id == permissionDto.Id)
                .SingleOrDefaultAsync();

            // Permission does not exist
            if (permission == null)
            {
                serviceResponse.Message = "Permission does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newPermission = permissionDto.Adapt(permission);

            //create an updated role
            _unitOfWork.PermissionRepo.Update(newPermission);
            newPermission.CreatedByUserId = _userId;
            newPermission.LastModifiedByUserId = _userId;

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newPermission.Adapt<PermissionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Permission updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update permission.");
            return serviceResponse;
        }
        return serviceResponse;
    }


    //Deletes a permission
    public async Task<ServiceResponse<bool>> DeletePermissionAsync(Guid id)
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
            var permission = await _unitOfWork.PermissionRepo
            .GetByConditionAsync(p => p.Id == id)
            .SingleOrDefaultAsync();

            //Check if permission not exists
            if (permission == null)
            {
                serviceResponse.Message = "Permission does not exist";
                return serviceResponse;
            }

            //Delete permission
            _unitOfWork.PermissionRepo.Delete(permission);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Permission deleted successfully";

        }
        catch(Exception ex)
        {
            _logger.LogError(ex, "Failed to delete permission {PermissionId}.", id);
            return serviceResponse;
        }
        return serviceResponse;
    }

    public async Task<HashSet<string>> GetPermissionsAsync(Guid userId)
    {
        var roles = await _userManager.Users
        .Include(x => x.UserRoles)
        .ThenInclude(x => x.Role)
        .ThenInclude(x => x.RolePermissions)
        .ThenInclude(x => x.Permission)
        .Where(x =>x.Id == userId)
        .Select(x => x.UserRoles)
        .ToArrayAsync();

        return roles
        .SelectMany(x => x)
        .SelectMany(x =>x.Role.RolePermissions)
        .Select(x => x.Permission.Name)
        .ToHashSet();
        
    }
}
