namespace AccountsAPIs.Services;

public class RoleManagementService : IRoleManagementService
{
    private readonly ILogger<RoleManagementService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public RoleManagementService(
        ILogger<RoleManagementService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Retrieves the User ID from HTTP context or assigns a default GUID if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Method to get the list of roles
    public async Task<ServiceResponse<IEnumerable<RoleManagementDto>>> GetRoleListAsync(Guid? tenantId)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<RoleManagementDto>>
        {
            Data = null,
            Message = "Failed to retrieve roles. Please try again"
        };

        try
        {
            // Fetches roles with associated entities, ordering by sequence and projecting into RoleDto
            var roleList = await _unitOfWork.AccountRoleRepo
                .GetAllAsync()
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.Tenant)
                .Include(i => i.RolePermissions)
                    .ThenInclude(i1 => i1.Permission)
                .OrderByDescending(o => o.Seq)
                .AsNoTracking()
                .ToListAsync();

            // Restrict to workspace-app roles so CRM placeholder roles never surface here
            roleList = roleList.Where(w => w.AppCode == PlatformAppsEnum.Workspace.ToAppCode()).ToList();

            if (tenantId.HasValue)
            {
                roleList = roleList.Where(w => w.TenantId == tenantId).ToList();
            }

            // Setting success response
            serviceResponse.Data = roleList.Adapt<IEnumerable<RoleManagementDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Roles retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve role list.");
        }

        return serviceResponse;
    }

    // Method to check if a role is available based on its name
    public async Task<ServiceResponse<TrueFalseResultDto>> IsRoleAvailableAsync(Guid tenantId, CheckAvailabilityDto checkAvailability)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check Role, Please try again"
        };

        try
        {

            // Check if role already exists by comparing case-insensitive role name
            var role = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(w =>
                    w.TenantId == tenantId &&
                    w.FullName.ToLower() == checkAvailability.UserInput.ToLower()
                )
                .FirstOrDefaultAsync();

            if (role != null)
            {
                // Role already exists
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A role with the same name already exists. Please enter a unique name.";
                return serviceResponse;
            }

            // Role is available
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role is available.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while checking Role Name availability: {Name}.", checkAvailability.UserInput);
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to insert a new role
    public async Task<ServiceResponse<RoleManagementDto>> InsertRoleAsync(RoleManagementDto roleManagementDto)
    {
        var serviceResponse = new ServiceResponse<RoleManagementDto>
        {
            Data = null,
            Message = "Failed to insert new role. Please try again"
        };

        try
        {
            // Check if the role already exists by comparing role names
            var existingRoles = await _unitOfWork.AccountRoleRepo.GetAllAsync().ToListAsync();
            if (existingRoles.Any(a => a.FullName == roleManagementDto.FullName && a.TenantId == roleManagementDto.TenantId))
            {
                serviceResponse.Message = "Role already exists, please select another role name.";
                return serviceResponse;
            }

            // Create a new role entity
            var newRole = roleManagementDto.Adapt<AccountRole>();
            newRole.TenantId = roleManagementDto.TenantId;
            newRole.CreatedByUserId = _userId;
            newRole.LastModifiedByUserId = _userId;
            newRole.CreatedOn = DateTimeOffset.UtcNow;
            newRole.Name = roleManagementDto.FullName;
            newRole.NormalizedName = roleManagementDto.FullName;
            newRole.Seq = existingRoles.Count;
            newRole.IsDefault = false;

            // Insert the new role into the database
            await _unitOfWork.AccountRoleRepo.InsertAsync(newRole);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Insert permissions for the new role
            var newRolePermissions = new List<RolePermission>();
            if (roleManagementDto.RolePermissions != null)
            {
                var permissionsList = await _unitOfWork.PermissionRepo.GetAllAsync().AsNoTracking().ToListAsync();
                foreach (var rolePermission in roleManagementDto.RolePermissions)
                {
                    var permission = permissionsList.FirstOrDefault(f => f.Name.Equals(rolePermission.PermissionType.ToString()));
                    if (permission != null && rolePermission.Accesses.Contains(PermissionAccessTypesEnum.FullAccess))
                    {
                        newRolePermissions.Add(new RolePermission()
                        {
                            Access = PermissionAccessTypesEnum.FullAccess,
                            AccountRoleId = newRole.Id,
                            PermissionId = permission.Id,
                            CreatedByUserId = _userId,
                            LastModifiedByUserId = _userId,
                            CreatedOn = DateTimeOffset.UtcNow,
                        });
                    }
                    if (permission != null && !rolePermission.Accesses.Contains(PermissionAccessTypesEnum.FullAccess))
                    {
                        newRolePermissions.AddRange(rolePermission.Accesses.Select(access => new RolePermission()
                        {
                            Access = access,
                            AccountRoleId = newRole.Id,
                            PermissionId = permission.Id,
                            CreatedByUserId = _userId,
                            LastModifiedByUserId = _userId,
                            CreatedOn = DateTimeOffset.UtcNow,
                        }));
                    }
                }
            }

            // Insert the new role permissions into the database
            if (newRolePermissions.Any())
            {
                await _unitOfWork.RolePermissionRepo.InsertAsync(newRolePermissions);

                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }
            }

            // Set success response
            serviceResponse.Data = newRole.Adapt<RoleManagementDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role added successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert role.");
            return serviceResponse; // Return failure if exception occurs
        }

        return serviceResponse;
    }

    // Method to get a role by its ID
    public async Task<ServiceResponse<RoleManagementDto>> GetRoleByIdAsync(Guid roleId)
    {
        var serviceResponse = new ServiceResponse<RoleManagementDto>
        {
            Data = null,
            Message = "Failed to retrieve role. Please try again"
        };

        try
        {
            // Fetch the role by ID and include related entities (CreatedBy, LastModifiedBy, Permissions)
            var existingRole = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(w => w.Id == roleId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.Tenant)
                .Include(i => i.RolePermissions)
                    .ThenInclude(i1 => i1.Permission)
                .SingleOrDefaultAsync();

            if (existingRole == null)
            {
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            // Map the role entity to RoleDto
            var roleDto = existingRole.Adapt<RoleManagementDto>();
            if (existingRole.RolePermissions?.Count != 0)
            {
                // Map the permissions into the role DTO
                roleDto.RolePermissions = existingRole.RolePermissions
                    .GroupBy(g => g.Permission.Name)
                    .Select(s => new AccountPermissionDto
                    {
                        PermissionType = (PermissionTypesEnum)Enum.Parse(typeof(PermissionTypesEnum), s.Key),
                        Accesses = s.Select(s1 => (PermissionAccessTypesEnum)Enum.Parse(typeof(PermissionAccessTypesEnum), s1.Access.ToString()))
                                    .Distinct()
                                    .ToList()
                    })
                    .ToList();
            }

            serviceResponse.Data = roleDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the role.");
        }

        return serviceResponse;
    }

    // Method to update an existing role
    public async Task<ServiceResponse<RoleManagementDto>> UpdateRoleAsync(RoleManagementDto roleManagementDto)
    {
        var serviceResponse = new ServiceResponse<RoleManagementDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Fetch the existing role from the repository
            var existingRole = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(w => w.Id == roleManagementDto.Id)
                .SingleOrDefaultAsync();

            if (existingRole == null)
            {
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            // Check if another role exists with the same name
            var duplicateRole = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(w =>
                    w.Id != roleManagementDto.Id &&
                    w.FullName.ToLower() == roleManagementDto.FullName.ToLower() &&
                    w.TenantId == roleManagementDto.TenantId
                )
                .FirstOrDefaultAsync();

            if (duplicateRole != null)
            {
                serviceResponse.Message = "Role already exists, please select another role name.";
                return serviceResponse;
            }

            // Check if the role is a default role, which cannot be updated
            if (existingRole.IsDefault)
            {
                serviceResponse.Message = "Cannot update the default role.";
                return serviceResponse;
            }

            // Update the role entity
            roleManagementDto.Adapt(existingRole);
            existingRole.LastModifiedByUserId = _userId;

            _unitOfWork.AccountRoleRepo.Update(existingRole);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Fetch current permissions associated with the role
            var currentPermissions = await _unitOfWork.RolePermissionRepo
                .GetByConditionAsync(w => w.AccountRoleId == existingRole.Id)
                .ToListAsync();

            // Add new permissions
            var newRolePermissions = new List<RolePermission>();
            if (roleManagementDto.RolePermissions != null)
            {
                var permissionsList = await _unitOfWork.PermissionRepo.GetAllAsync().AsNoTracking().ToListAsync();

                foreach (var rolePermission in roleManagementDto.RolePermissions)
                {
                    var permission = permissionsList.FirstOrDefault(f => f.Name.Equals(rolePermission.PermissionType.ToString()));
                    if (permission != null && rolePermission.Accesses.Contains(PermissionAccessTypesEnum.FullAccess))
                    {
                        newRolePermissions.Add(new RolePermission()
                        {
                            Access = PermissionAccessTypesEnum.FullAccess,
                            AccountRoleId = existingRole.Id,
                            PermissionId = permission.Id,
                            CreatedByUserId = _userId,
                            LastModifiedByUserId = _userId,
                            CreatedOn = DateTimeOffset.UtcNow,
                        });
                    }
                    if (permission != null && !rolePermission.Accesses.Contains(PermissionAccessTypesEnum.FullAccess))
                    {
                        newRolePermissions.AddRange(rolePermission.Accesses.Select(s => new RolePermission()
                        {
                            Access = s,
                            AccountRoleId = existingRole.Id,
                            PermissionId = permission.Id,
                            CreatedByUserId = _userId,
                            LastModifiedByUserId = _userId,
                            CreatedOn = DateTimeOffset.UtcNow,
                        }));
                    }
                }
            }

            // Insert new permissions
            if (newRolePermissions.Any())
            {
                await _unitOfWork.RolePermissionRepo.InsertAsync(newRolePermissions);

                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }
            }

            // Delete current permissions
            if (currentPermissions.Any())
            {
                _unitOfWork.RolePermissionRepo.Delete(currentPermissions);

                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }
            }

            // Return the updated role as response
            serviceResponse.Data = existingRole.Adapt<RoleManagementDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update role.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to delete a role by its ID
    public async Task<ServiceResponse<bool>> DeleteRoleAsync(Guid roleId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            // Fetch the role by ID with related entities
            var roleToDelete = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(w => w.Id == roleId)
                .Include(i => i.RolePermissions)
                .Include(i => i.UserRoles)
                .SingleOrDefaultAsync();

            if (roleToDelete == null)
            {
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            // Check if the role is default, which cannot be deleted
            if (roleToDelete.IsDefault)
            {
                serviceResponse.Message = "Cannot delete the default role.";
                return serviceResponse;
            }

            // Delete the role from the repository
            _unitOfWork.AccountRoleRepo.Delete(roleToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete role {RoleId}.", roleId);
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Method to delete multiple roles
    public async Task<ServiceResponse<bool>> DeleteMultipleRolesAsync(IEnumerable<Guid> roleIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete multiple roles. Please try again."
        };

        // Check if role IDs were provided
        if (roleIds == null || !roleIds.Any())
        {
            serviceResponse.Message = "No Role IDs provided for deletion.";
            return serviceResponse;
        }

        try
        {
            // Fetch the roles to delete
            var roles = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(w => roleIds.Contains(w.Id))
                .Include(i => i.RolePermissions)
                .Include(i => i.UserRoles)
                .ToListAsync();

            if (roles.Count == 0)
            {
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            // Check if any role is default, which cannot be deleted
            if (roles.Any(a => a.IsDefault))
            {
                serviceResponse.Message = "Cannot delete the default role.";
                return serviceResponse;
            }


            // Delete the roles
            _unitOfWork.AccountRoleRepo.Delete(roles);

            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{roles.Count} roles deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while deleting multiple roles.");
        }

        return serviceResponse;
    }

    //Retrieves a list of account roles formatted as select options
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetRoleOptionListAsync(Guid tenantId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {

            // Get all roles after filtration
            var roles = await _unitOfWork.AccountRoleRepo
                        .GetByConditionAsync(w => w.TenantId == tenantId)
                        .OrderBy(o => o.Seq)
                        .ToListAsync();

            // Task successful
            serviceResponse.Data = roles.Adapt<IEnumerable<SelectOption>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Roles retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve role options.");
            return serviceResponse;
        }

        return serviceResponse;
    }
}
