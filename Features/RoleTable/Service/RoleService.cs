namespace AccountsAPIs.Services;

public class RoleService : IRoleService
{
    private readonly ILogger<RoleService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public RoleService(
        ILogger<RoleService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Retrieves the User ID from HTTP context or assigns a default GUID if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Method to get the list of roles
    public async Task<ServiceResponse<IEnumerable<RoleDto>>> GetRoleListAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<RoleDto>>
        {
            Data = null,
            Message = "Failed to retrieve roles. Please try again"
        };

        try
        {
            // Fetches roles with associated entities, ordering by sequence and projecting into RoleDto
            var roleList = await _unitOfWork.AccountRoleRepo
                .GetAllAsync()
                .Include(a => a.CreatedByUser)
                .Include(a => a.LastModifiedByUser)
                .Include(a => a.RolePermissions)
                    .ThenInclude(b => b.Permission)
                .OrderByDescending(o => o.Seq)
                .AsNoTracking()
                .ProjectToType<RoleDto>()
                .ToListAsync();

            // Setting success response
            serviceResponse.Data = roleList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Roles retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse; // Return failure if exception occurs
        }

        return serviceResponse;
    }

    // Method to check if a role is available based on its name
    public async Task<ServiceResponse<TrueFalseResultDto>> IsRoleAvailableAsync(CheckAvailabilityDto checkAvailability)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check Role, Please try again"
        };

        try
        {
            _logger.LogInformation("Checking if Role Name is available: {Name}", checkAvailability.UserInput);

            // Check if role already exists by comparing case-insensitive role name
            var role = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(c => c.FullName.ToLower() == checkAvailability.UserInput.ToLower())
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
            return serviceResponse; // Return failure if exception occurs
        }

        return serviceResponse;
    }

    // Method to insert a new role
    public async Task<ServiceResponse<RoleDto>> InsertRoleAsync(RoleDto roleDto)
    {
        var serviceResponse = new ServiceResponse<RoleDto>
        {
            Data = null,
            Message = "Failed to insert new role. Please try again"
        };

        try
        {
            // Check if the role already exists by comparing role names
            var existingRoles = await _unitOfWork.AccountRoleRepo.GetAllAsync().ToListAsync();
            if (existingRoles.Any(role => role.FullName == roleDto.FullName))
            {
                _logger.LogInformation("Role already exists, please select another role name.");
                serviceResponse.Message = "Role already exists, please select another role name.";
                return serviceResponse;
            }

            // Create a new role entity
            var newRole = roleDto.Adapt<AccountRole>();
            newRole.CreatedByUserId = _userId;
            newRole.LastModifiedByUserId = _userId;
            newRole.CreatedOn = DateTimeOffset.UtcNow;
            newRole.Name = roleDto.FullName;
            newRole.NormalizedName = roleDto.FullName;
            newRole.Seq = existingRoles.Count;
            newRole.IsDefault = false;

            // Insert the new role into the database
            await _unitOfWork.AccountRoleRepo.InsertAsync(newRole);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new role.");
                return serviceResponse;
            }

            // Insert permissions for the new role
            var newRolePermissions = new List<RolePermission>();
            if (roleDto.RolePermissions != null)
            {
                var permissionsList = await _unitOfWork.PermissionRepo.GetAllAsync().AsNoTracking().ToListAsync();
                foreach (var rolePermission in roleDto.RolePermissions)
                {
                    var permission = permissionsList.FirstOrDefault(p => p.Name.Equals(rolePermission.PermissionType.ToString()));
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
                    _logger.LogInformation("Context SaveChanges failed while inserting new role permissions.");
                    return serviceResponse;
                }
            }

            // Set success response
            serviceResponse.Data = newRole.Adapt<RoleDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role added successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse; // Return failure if exception occurs
        }

        return serviceResponse;
    }

    // Method to get a role by its ID
    public async Task<ServiceResponse<RoleDto>> GetRoleByIdAsync(Guid accountRoleId)
    {
        var serviceResponse = new ServiceResponse<RoleDto>
        {
            Data = null,
            Message = "Failed to retrieve role. Please try again"
        };

        try
        {
            // Fetch the role by ID and include related entities (CreatedBy, LastModifiedBy, Permissions)
            var existingRole = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(role => role.Id == accountRoleId)
                .Include(a => a.CreatedByUser)
                .Include(a => a.LastModifiedByUser)
                .Include(a => a.RolePermissions)
                    .ThenInclude(b => b.Permission)
                .SingleOrDefaultAsync();

            if (existingRole == null)
            {
                _logger.LogInformation("Role does not exist");
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            // Map the role entity to RoleDto
            var roleDto = existingRole.Adapt<RoleDto>();
            if (existingRole.RolePermissions?.Any() == true)
            {
                // Map the permissions into the role DTO
                roleDto.RolePermissions = existingRole.RolePermissions
                    .GroupBy(arp => arp.Permission.Name)
                    .Select(g => new AccountPermissionDto
                    {
                        PermissionType = (PermissionTypesEnum)Enum.Parse(typeof(PermissionTypesEnum), g.Key),
                        Accesses = g.Select(a => (PermissionAccessTypesEnum)Enum.Parse(typeof(PermissionAccessTypesEnum), a.Access.ToString()))
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
    public async Task<ServiceResponse<RoleDto>> UpdateRoleAsync(RoleDto roleDto)
    {
        var serviceResponse = new ServiceResponse<RoleDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Fetch the existing role from the repository
            var existingRole = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(role => role.Id == roleDto.Id)
                .SingleOrDefaultAsync();

            if (existingRole == null)
            {
                _logger.LogInformation("Role does not exist");
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            // Check if another role exists with the same name
            var duplicateRole = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(role => role.Id != roleDto.Id && role.FullName == roleDto.FullName)
                .FirstOrDefaultAsync();

            if (duplicateRole != null)
            {
                _logger.LogInformation("Role already exists, please select another role name.");
                serviceResponse.Message = "Role already exists, please select another role name.";
                return serviceResponse;
            }

            // Check if the role is a default role, which cannot be updated
            if (existingRole.IsDefault)
            {
                _logger.LogInformation("Cannot update the default role.");
                serviceResponse.Message = "Cannot update the default role.";
                return serviceResponse;
            }

            // Update the role entity
            roleDto.Adapt(existingRole);
            existingRole.LastModifiedByUserId = _userId;

            _unitOfWork.AccountRoleRepo.Update(existingRole);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating role.");
                return serviceResponse;
            }

            // Fetch current permissions associated with the role
            var currentPermissions = await _unitOfWork.RolePermissionRepo
                .GetByConditionAsync(arp => arp.AccountRoleId == existingRole.Id)
                .ToListAsync();

            // Add new permissions
            var newRolePermissions = new List<RolePermission>();
            if (roleDto.RolePermissions != null)
            {
                var permissionsList = await _unitOfWork.PermissionRepo.GetAllAsync().AsNoTracking().ToListAsync();

                foreach (var rolePermission in roleDto.RolePermissions)
                {
                    var permission = permissionsList.FirstOrDefault(p => p.Name.Equals(rolePermission.PermissionType.ToString()));
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
                        newRolePermissions.AddRange(rolePermission.Accesses.Select(access => new RolePermission()
                        {
                            Access = access,
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
                    _logger.LogInformation("Context SaveChanges failed while inserting new role permissions.");
                    return serviceResponse;
                }
            }

            // Delete current permissions
            if (currentPermissions.Any())
            {
                _unitOfWork.RolePermissionRepo.Delete(currentPermissions);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Context SaveChanges failed while deleting existing role permissions.");
                    return serviceResponse;
                }
            }

            // Return the updated role as response
            serviceResponse.Data = existingRole.Adapt<RoleDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse; // Return failure if exception occurs
        }

        return serviceResponse;
    }

    // Method to delete a role by its ID
    public async Task<ServiceResponse<bool>> DeleteRoleAsync(Guid accountRoleId)
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
                .GetByConditionAsync(role => role.Id == accountRoleId)
                .Include(a => a.RolePermissions)
                .Include(a => a.UserRoles)
                .SingleOrDefaultAsync();

            if (roleToDelete == null)
            {
                _logger.LogInformation("Role does not exist");
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            // Check if the role is default, which cannot be deleted
            if (roleToDelete.IsDefault)
            {
                _logger.LogInformation("Cannot delete the default role.");
                serviceResponse.Message = "Cannot delete the default role.";
                return serviceResponse;
            }

            // Delete the role from the repository
            _unitOfWork.AccountRoleRepo.Delete(roleToDelete);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting a role.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Role deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse; // Return failure if exception occurs
        }

        return serviceResponse;
    }

    // Method to delete multiple roles
    public async Task<ServiceResponse<bool>> DeleteMultipleRolesAsync(IEnumerable<Guid> accountRoleIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete multiple roles. Please try again."
        };

        // Check if role IDs were provided
        if (accountRoleIds == null || !accountRoleIds.Any())
        {
            serviceResponse.Message = "No Role IDs provided for deletion.";
            return serviceResponse;
        }

        try
        {
            // Fetch the roles to delete
            var roles = await _unitOfWork.AccountRoleRepo
                .GetByConditionAsync(w => accountRoleIds.Contains(w.Id))
                .Include(a => a.RolePermissions)
                .Include(a => a.UserRoles)
                .ToListAsync();

            if (roles.Count == 0)
            {
                _logger.LogInformation($"Role not found for Ids {accountRoleIds}");
                serviceResponse.Message = "Role does not exist";
                return serviceResponse;
            }

            // Check if any role is default, which cannot be deleted
            if (roles.Any(r => r.IsDefault))
            {
                _logger.LogInformation("Cannot delete the default role.");
                serviceResponse.Message = "Cannot delete the default role.";
                return serviceResponse;
            }

            _logger.LogInformation($"Found {roles.Count} roles to delete.");

            // Delete the roles
            _unitOfWork.AccountRoleRepo.Delete(roles);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation($"Failed to save changes while deleting the roles with IDs {accountRoleIds}.");
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
}