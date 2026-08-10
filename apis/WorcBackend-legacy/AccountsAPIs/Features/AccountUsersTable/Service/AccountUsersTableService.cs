namespace AccountsAPIs.Services;

public class AccountUsersTableService : IAccountUsersTableService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<AccountUser> _userManager;
    private readonly RoleManager<AccountRole> _roleManager;
    private readonly ILogger<AccountUsersTableService> _logger;
    private readonly IAuthHelperService _authHelperService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly string _jwt;
    private readonly Guid _userId;

    public AccountUsersTableService(
        UserManager<AccountUser> userManager,
        RoleManager<AccountRole> roleManager,
        ILogger<AccountUsersTableService> logger,
        IAuthHelperService authHelperService,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService,
        IHttpContextAccessor httpContextAccessor,
        IUnitOfWork unitOfWork)
    {
        // Set _jwt, _userId and _userRoles
        _jwt = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? "jwt-not-found";
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
        _authHelperService = authHelperService;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a list of account users.
    public async Task<ServiceResponse<IEnumerable<AccountUsersTableDto>>> GetAccountUsersAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<AccountUsersTableDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Get allowed user roles to manage
            var allowedRoles = _userManagementGuardService.GetAllowedRoleListToManageUser();

            // Get users as Queryable
            var users = await _userManager.Users
                .Include(i => i.UserRoles)
                .ThenInclude(i => i.Role)
                .Where(w =>
                    w.IsDefault == false &&
                    w.Id != _userId &&
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.UserRoles.Where(w1 => allowedRoles.Contains(w1.Role.Name)).Select(s => s.UserId).Contains(w.Id))
                .ProjectToType<AccountUsersTableDto>()
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Populate the Spaces property for each user by querying the SpaceUser table.
            // NOTE: We return space IDs (not names) because the frontend form's spaces
            // multi-select stores option values (space IDs) and resolves labels from the
            // spaces-to-select options. The table column maps these IDs back to names.
            var userIds = users.Select(u => u.Id).ToList();
            var spaceUsers = await _unitOfWork.SpaceUserRepo
                .GetByConditionAsync(w => w.TenantId == _currentTenantService.CurrentTenantId && userIds.Contains(w.UserId))
                .Include(i => i.Space)
                .ToListAsync();

            var spaceIdsByUser = spaceUsers
                .Where(w => w.IsActive && w.Space != null)
                .GroupBy(g => g.UserId)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(s => s.SpaceId.ToString()).Distinct().OrderBy(n => n).ToList());

            foreach (var user in users)
            {
                user.Spaces = spaceIdsByUser.TryGetValue(user.Id, out var ids) ? ids : new List<string>();
            }

            // Task successful
            serviceResponse.Data = users.Adapt<IEnumerable<AccountUsersTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Inserts a new account user.
    public async Task<ServiceResponse<AccountUsersTableDto>> InsertAccountUserAsync(AccountUsersTableDto accountUsersTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AccountUsersTableDto>
        {
            Data = null,
            Message = "Failed to insert user. Please try again"
        };

        try
        {
            // Fetch the current active subscription for the tenant
            var currentSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.IsActive)
                .Include(w => w.Plan)
                .FirstOrDefaultAsync();

            // Log: Checking if subscription exists
            _logger.LogInformation("Checking subscription for TenantId: {TenantId}", _currentTenantService.CurrentTenantId);

            if (currentSubscription == null)
            {
                _logger.LogWarning("No active subscription found for TenantId: {TenantId}", _currentTenantService.CurrentTenantId);
                serviceResponse.Message = "No active subscription found. Please subscribe to a plan to continue.";
                return serviceResponse;
            }

            // Check if the subscription plan is 'Starter'
            if (currentSubscription.Plan.Type == SubscriptionPlanTypeEnum.Starter)
            {
                // Check if user limit has been reached
                var userCount = await _userManager.Users
                    .Where(w => w.TenantId == _currentTenantService.CurrentTenantId && !w.IsDefault)
                    .CountAsync();

                // Log and return current user count and max users allowed
                if (userCount >= currentSubscription.MaxUsers)
                {
                    _logger.LogWarning("User limit reached. Current user count: {UserCount}, Max users allowed: {MaxUsers}",
                        userCount, currentSubscription.MaxUsers);
                    serviceResponse.Message = $"User limit reached: Your current plan (Starter) allows a maximum of {currentSubscription.MaxUsers} users.";
                    return serviceResponse;
                }
            }

            // Convert roles FullName to Name (Frontend will return roles in "FullName" of IdentityRole. However userManger work with "Name" of IdentityRole
            var toBeAddedUserRoles = await TransformRoleFullNameToName(accountUsersTableDto.UserRoles);

            // Request is not allowed to manage user
            if (!_userManagementGuardService.IsAllowedToManageAccountsDbUser(toBeAddedUserRoles, Guid.Empty))
            {
                // Message is already logged in IsAllowedToManageUser method
                serviceResponse.Message = "You're not allowed to manage user";
                return serviceResponse;
            }

            // Validate username uniqueness - Not adding TenantId filter since email column is unqiue for whole table.
            var userAlreadyExists = await _userManager.Users.AnyAsync(w =>
                                     w.Email.ToLower() == accountUsersTableDto.Email.ToLower());

            // User already exists
            if (userAlreadyExists)
            {
                _logger.LogInformation($"User already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A user with same email already exists. Please enter a unique Email";
                return serviceResponse;
            }

            // Trim dto' string props
            accountUsersTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(accountUsersTableDto);

            // Default mapping - keep UserRoles prop name different in dto to avoid error at the time of mapping 
            var newUser = accountUsersTableDto.Adapt<AccountUser>();
            newUser.Id = Guid.NewGuid();
            newUser.UserName = accountUsersTableDto.Email.ToLower();
            newUser.Email = accountUsersTableDto.Email.ToLower();
            newUser.TenantId = _currentTenantService.CurrentTenantId; // DO NOT CHANGE THIS
            newUser.EmailConfirmed = false; // DO NOT CHANGE THIS
            newUser.CreatedByUserId = _userId;
            newUser.LastModifiedByUserId = _userId;

            // Additional mapping
            newUser.IsDefault = false; // DO NOT CHANGE THIS
            newUser.IsEditable = true; // DO NOT CHANGE THIS

            // Try to add user in other databases
            var createUserInOtherDbsResult = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(newUser, CrudTypesEnum.Create, _jwt);

            // Failed to add user in other databases
            if (!createUserInOtherDbsResult) return serviceResponse;

            // Update IsCreatedInOtherDbs prop
            newUser.IsCreatedInOtherDbs = true;

            // Create Identity user using UserManager
            var createUserResult = await _userManager.CreateAsync(newUser);

            // User Insert-Job failed
            if (!createUserResult.Succeeded)
            {
                _logger.LogInformation("Failed while creating new user");
                return serviceResponse;
            }

            // Add Indentity Roles to user using UserManager
            var createRolesResult = await _userManager.AddToRolesAsync(newUser, toBeAddedUserRoles);

            // Add to Roles Task failed
            if (!createRolesResult.Succeeded)
            {
                _logger.LogInformation("Failed while adding roles to user");
                return serviceResponse;
            }

            // Persist the selected spaces to the SpaceUser table so the user's
            // space membership is reflected in the Users table.
            await SyncUserSpacesAsync(newUser.Id, accountUsersTableDto.Spaces);

            // Task successful
            serviceResponse.Data = newUser.Adapt<AccountUsersTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an account user.
    public async Task<ServiceResponse<AccountUsersTableDto>> UpdateAccountUserAsync(AccountUsersTableDto accountUsersTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AccountUsersTableDto>
        {
            Data = null,
            Message = "Failed to update user. Please try again"
        };

        try
        {
            // Get allowed user roles to manage
            var allowedRoles = _userManagementGuardService.GetAllowedRoleListToManageUser();

            // Convert roles FullName to Name (Frontend will return roles in "FullName" of IdentityRole. However userManger work with "Name" of IdentityRole
            var toBeAddedUserRoles = await TransformRoleFullNameToName(accountUsersTableDto.UserRoles);

            // Request is not allowed to manage user role which is going to be added
            if (!_userManagementGuardService.IsAllowedToManageAccountsDbUser(toBeAddedUserRoles, accountUsersTableDto.Id))
            {
                // Message is already logged in IsAllowedToManageUser method
                serviceResponse.Message = "You're not allowed to manage user";
                return serviceResponse;
            }

            // Try to get user to validate its existence
            var user = await _userManager.Users
                .Include(i => i.UserRoles)
                .ThenInclude(i => i.Role)
                .Where(w =>
                    w.Id == accountUsersTableDto.Id &&
                    w.IsDefault == false &&
                    w.Id != _userId &&
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.UserRoles.Where(w1 => allowedRoles.Contains(w1.Role.Name)).Select(s => s.UserId).Contains(w.Id))
                .SingleOrDefaultAsync();

            // User does not exist
            if (user == null)
            {
                _logger.LogInformation($"User does not exist");
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // Validate user uniqueness - Not adding TenantId filter since email column is unqiue for whole table
            var userAlreadyExists = await _userManager.Users.AnyAsync(w =>
                                            w.Email.ToLower() == accountUsersTableDto.Email.ToLower() &&
                                            w.Id != accountUsersTableDto.Id);

            // User already exists
            if (userAlreadyExists)
            {
                _logger.LogInformation($"User already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A user with same Email already exists. Please enter a unique Email";
                return serviceResponse;
            }

            // Trim dto' string props
            accountUsersTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(accountUsersTableDto);

            // Has email changed? (Note: Check before auto mapping)
            var hasEmailChanged = user.Email.ToLower() == accountUsersTableDto.Email.ToLower();

            // Default mapping 
            accountUsersTableDto.Adapt(user);
            user.EmailConfirmed = hasEmailChanged;
            user.UserName = accountUsersTableDto.Email.ToLower();
            user.Email = accountUsersTableDto.Email.ToLower();
            user.LastModifiedByUserId = _userId;
            user.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update Indentity User using UserManager
            var updateUserResult = await _userManager.UpdateAsync(user);

            // User Update-Job failed
            if (!updateUserResult.Succeeded)
            {
                _logger.LogInformation("Failed while updating user");
                return serviceResponse;
            }

            // Update user roles (M2M relationship)
            var updateUserRolesResult = await UpdateAccountUserRoles(user, toBeAddedUserRoles);

            // Update user roles jab failed
            if (!updateUserRolesResult)
            {
                _logger.LogInformation("Failed while updating User roles");
                return serviceResponse;
            }

            // Persist the selected spaces to the SpaceUser table so the user's
            // space membership is reflected in the Users table.
            await SyncUserSpacesAsync(user.Id, accountUsersTableDto.Spaces);

            // Update user in other databases
            if (user.IsCreatedInOtherDbs)
            {
                // Try to update user in other databases
                var updateUserInOtherDbsResult = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(user, CrudTypesEnum.Update, _jwt);

                // Failed to update user in other databases
                if (!updateUserInOtherDbsResult) return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = user.Adapt<AccountUsersTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes an account user.
    public async Task<ServiceResponse<bool>> DeleteAccountUserAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete user. Please try again"
        };

        try
        {
            // Get allowed user roles to manage
            var allowedRoles = _userManagementGuardService.GetAllowedRoleListToManageUser();

            // Try to get user to validate its existence
            var user = await _userManager.Users
                .Include(i => i.UserRoles)
                .ThenInclude(i => i.Role)
                .Where(w =>
                    w.Id == id &&
                    w.IsDefault == false &&
                    w.Id != _userId &&
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.UserRoles.Where(w1 => allowedRoles.Contains(w1.Role.Name)).Select(s => s.UserId).Contains(w.Id))
                .SingleOrDefaultAsync();

            // Get user roles
            var userRoleNames = user.UserRoles.Select(s => s.Role.Name).ToList();

            // User does not exist
            if (user == null)
            {
                _logger.LogInformation($"User does not exist");
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // Delete user
            var deleteUserResult = await _userManager.DeleteAsync(user);

            // Delete-Job failed
            if (!deleteUserResult.Succeeded)
            {
                _logger.LogInformation("Failed while deleting user");
                return serviceResponse;
            }

            // Try to delete user in other databases
            var deleteUserInOtherDbsResult = await _authHelperService.DeleteUserInOtherDbsAsync(id, _jwt);

            // Failed to delete user in other databases
            if (!deleteUserInOtherDbsResult) return serviceResponse;

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves the account roles basis current user top role.
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetAccountRolesAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Get allowed user roles to manage
            var allowedRoles = _userManagementGuardService.GetAllowedRoleListToManageUser();

            // Get all roles after filteration
            var roles = await _roleManager.Roles.Where(w => allowedRoles.Contains(w.Name)).OrderBy(o => o.Seq).ToListAsync();

            // Task successful
            serviceResponse.Data = roles.Adapt<IEnumerable<SelectOption>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves the list of spaces for the current tenant, for use in user space assignment.
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetAccountSpacesAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Get all spaces for the current tenant
            var spaces = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(w => w.TenantId == _currentTenantService.CurrentTenantId)
                .OrderBy(o => o.Name)
                .ToListAsync();

            // Map to SelectOption format
            serviceResponse.Data = spaces.Select(s => new SelectOption
            {
                Label = s.Name,
                Value = s.Id.ToString(),
                Description = s.Description,
                IsDefault = s.IsDefault
            }).ToList();

            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Spaces retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Persists the user's selected spaces to the SpaceUser table. Removes any
    // previously assigned spaces that are no longer selected and adds the new ones.
    private async Task SyncUserSpacesAsync(Guid userId, List<string> spaceIds)
    {
        try
        {
            var tenantId = _currentTenantService.CurrentTenantId;

            // Parse the selected space IDs (ignore invalid entries).
            var selectedIds = (spaceIds ?? new List<string>())
                .Where(id => Guid.TryParse(id, out _))
                .Select(Guid.Parse)
                .ToHashSet();

            // Fetch the user's current space memberships.
            var existing = await _unitOfWork.SpaceUserRepo
                .GetByConditionAsync(w => w.UserId == userId && w.TenantId == tenantId)
                .ToListAsync();

            // Remove memberships that are no longer selected.
            var toRemove = existing.Where(w => !selectedIds.Contains(w.SpaceId)).ToList();
            if (toRemove.Count > 0)
                _unitOfWork.SpaceUserRepo.Delete(toRemove);

            // Add memberships for newly selected spaces.
            var existingSpaceIds = existing.Select(w => w.SpaceId).ToHashSet();
            var toAdd = selectedIds
                .Where(id => !existingSpaceIds.Contains(id))
                .Select(id => new SpaceUser
                {
                    UserId = userId,
                    SpaceId = id,
                    TenantId = tenantId,
                    IsActive = true,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                })
                .ToList();

            if (toAdd.Count > 0)
                await _unitOfWork.SpaceUserRepo.InsertAsync(toAdd);

            if (toRemove.Count > 0 || toAdd.Count > 0)
                await _unitOfWork.SaveAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to sync spaces for user {UserId}.", userId);
        }
    }

    // Updates the roles of an account user. Removes unassinged ones and add new ones if there is any requirement
    public async Task<bool> UpdateAccountUserRoles(AccountUser accountUser, List<string> rolesToUpdate)
    {
        try
        {
            // Get currently assigned roles of User
            var userCurrentRoles = await _userManager.GetRolesAsync(accountUser);

            // Get roles list to remove
            var rolesToRemove = userCurrentRoles.Where(roleName => !rolesToUpdate.Contains(roleName)).ToList();

            // Get role list to add
            var rolesToAdd = rolesToUpdate.Where(roleName => !userCurrentRoles.Contains(roleName)).ToList();

            // Try to remove if there is any role to remove
            if (rolesToRemove.Count > 0)
            {
                // Try to remove
                var userRoleRemoveResult = await _userManager.RemoveFromRolesAsync(accountUser, rolesToRemove);

                // If failed
                if (!userRoleRemoveResult.Succeeded) return false;
            }

            // Try to add if there is any role to add
            if (rolesToAdd.Count > 0)
            {
                // Try to add
                var userRoleAddResult = await _userManager.AddToRolesAsync(accountUser, rolesToAdd);

                // If failed
                if (!userRoleAddResult.Succeeded) return false;
            }

            // Task successful
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return false;
        }
    }

    // Disable multiple users by their IDs.
    public async Task<ServiceResponse<bool>> DisableUsersAsync(List<Guid> ids)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to disable users. Please try again"
        };

        try
        {
            // Get allowed user roles to manage
            var allowedRoles = _userManagementGuardService.GetAllowedRoleListToManageUser();

            // Try to get users to validate its existence
            var users = await _userManager.Users
                .Include(i => i.UserRoles)
                .ThenInclude(i => i.Role)
                .Where(w =>
                    ids.Contains(w.Id) &&
                    w.IsDefault == false &&
                    w.Id != _userId &&
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.UserRoles.Where(w1 => allowedRoles.Contains(w1.Role.Name)).Select(s => s.UserId).Contains(w.Id))
                .ToListAsync();

            // Users do not exist
            if (users.Count == 0)
            {
                _logger.LogInformation($"Users do not exist");
                serviceResponse.Message = "Users do not exist";
                return serviceResponse;
            }

            // Disable users
            var isUpdateSuccessful = true;
            foreach (var user in users)
            {
                user.IsDisabled = true;
                user.LastModifiedByUserId = _userId;
                user.LastModifiedOn = DateTimeOffset.UtcNow;

                // Update Indentity User using UserManager
                var updateUserResult = await _userManager.UpdateAsync(user);

                // User Update-Job failed
                if (!updateUserResult.Succeeded)
                {
                    _logger.LogInformation($"Failed while disabling user {user.UserName}");
                    isUpdateSuccessful = false;
                }
            }

            // Update-Job failed
            if (!isUpdateSuccessful)
                return serviceResponse;

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users disabled successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // HelperFn: Transform roles "FullName" to "Name". Frontend will return roles in "FullName" of IdentityRole. However userManger work with "Name" of IdentityRole
    private async Task<List<string?>> TransformRoleFullNameToName(List<string> rolesToTransform)
    {
        try
        {
            // Get app roles. Note: StringComparer.OrdinalIgnoreCase cannot apply to db query
            var appRoles = await _roleManager.Roles.ToListAsync();

            // Transform roles FullName to Name
            var userToManageRoles = appRoles
                .Where(w =>
                    rolesToTransform.Contains(w.FullName, StringComparer.OrdinalIgnoreCase))
                .OrderBy(o => o.Seq)
                .Select(s => s.Name)
                .ToList();

            return userToManageRoles;
        }
        catch
        {
            return new List<string?>();
        }
    }
}