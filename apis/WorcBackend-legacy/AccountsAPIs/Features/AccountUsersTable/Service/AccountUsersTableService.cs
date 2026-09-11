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
    private readonly PlatformAppsEnum? _platformApp;

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

        // Set _platformApp. Null when the X-App-Context header is missing or not a known app code.
        _platformApp = PlatformAppHeaderUtil.TryParseAppCode(
            httpContextAccessor.HttpContext?.Request.Headers[PlatformAppHeaderUtil.HeaderName].FirstOrDefault(),
            out var platformApp)
            ? platformApp : null;

        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
        _authHelperService = authHelperService;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
        _unitOfWork = unitOfWork;
    }

    // Resolves the requesting application from the X-App-Context header.
    // Returns false (and sets the failure response) when the header is missing or invalid.
    private bool TryGetPlatformApp<T>(out PlatformAppsEnum platformApp, ServiceResponse<T> serviceResponse)
    {
        if (_platformApp != null)
        {
            platformApp = _platformApp.Value;
            return true;
        }

        platformApp = default;
        serviceResponse.StatusCode = 400;
        serviceResponse.Message = "Missing or invalid X-App-Context header";
        return false;
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
            // Requesting app must be identified via the X-App-Context header
            if (!TryGetPlatformApp(out var platformApp, serviceResponse)) return serviceResponse;
            var appCode = platformApp.ToAppCode();

            // Get allowed user roles to manage
            var allowedRoles = _userManagementGuardService.GetAllowedRoleListToManageUser();

            // Get users as Queryable. A user is listed when they hold no role in the requesting
            // app (so an admin can still grant them access) or when every role they hold in that
            // app is one the requester is allowed to manage. Users holding an app role the
            // requester cannot manage stay hidden, because an update would otherwise silently
            // drop that role (rolesAfterUpdate only preserves roles of other apps).
            var users = await _userManager.Users
                .Include(i => i.UserRoles)
                .ThenInclude(i => i.Role)
                .Where(w =>
                    w.IsDefault == false &&
                    w.Id != _userId &&
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    !w.UserRoles.Any(ur =>
                        ur.Role != null &&
                        ur.Role.AppCode == appCode &&
                        !allowedRoles.Contains(ur.Role.Name)))
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Map the users to DTOs
            var userDtos = users.Adapt<List<AccountUsersTableDto>>();

            // Keep only the requesting app's roles for each user. A user without any role in
            // this app still appears in the list, but with an empty roles collection.
            var appRoleFullNamesByUser = users.ToDictionary(
                u => u.Id,
                u => (u.UserRoles ?? new List<AccountUserRole>())
                    .Where(ur => ur.Role != null && ur.Role.AppCode == appCode)
                    .Select(ur => ur.Role!.FullName!)
                    .ToList());

            foreach (var userDto in userDtos)
            {
                userDto.UserRoles = appRoleFullNamesByUser.TryGetValue(userDto.Id, out var roleFullNames)
                    ? roleFullNames
                    : new List<string>();
            }

            // Populate the Spaces property for each user by querying the SpaceUser table.
            // NOTE: We return space IDs (not names) because the frontend form's spaces
            // multi-select stores option values (space IDs) and resolves labels from the
            // spaces-to-select options. The table column maps these IDs back to names.
            var userIds = userDtos.Select(u => u.Id).ToList();
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

            foreach (var userDto in userDtos)
            {
                userDto.Spaces = spaceIdsByUser.TryGetValue(userDto.Id, out var ids) ? ids : new List<string>();
            }

            // Task successful
            serviceResponse.Data = userDtos;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users retrieved successfully";
        }
        catch
        {
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

            // Requesting app must be identified via the X-App-Context header
            if (!TryGetPlatformApp(out var platformApp, serviceResponse)) return serviceResponse;

            // Convert roles FullName to Name (Frontend will return roles in "FullName" of IdentityRole. However userManger work with "Name" of IdentityRole
            var appRoles = await AccountUsersHelper.FetchAllRolesAsync(_roleManager);
            var toBeAddedUserRoles = AccountUsersHelper.TransformRoleFullNameToName(appRoles, accountUsersTableDto.UserRoles);

            // For a new user every role must belong to the requesting app
            var appRoleNameSet = AccountUsersHelper.GetAppRoleNames(appRoles, platformApp);
            if (!toBeAddedUserRoles.All(w => appRoleNameSet.Contains(w)))
            {
                serviceResponse.Message = "One or more roles do not belong to the requesting app";
                return serviceResponse;
            }

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
                return serviceResponse;
            }

            // Add Indentity Roles to user using UserManager
            var createRolesResult = await _userManager.AddToRolesAsync(newUser, toBeAddedUserRoles);

            // Add to Roles Task failed
            if (!createRolesResult.Succeeded)
            {
                return serviceResponse;
            }

            // Persist the selected spaces to the SpaceUser table so the user's
            // space membership is reflected in the Users table.
            await AccountUsersHelper.SyncUserSpacesAsync(_unitOfWork, _currentTenantService, _logger, _userId, newUser.Id, accountUsersTableDto.Spaces);

            // Task successful
            serviceResponse.Data = newUser.Adapt<AccountUsersTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User created successfully";
        }
        catch
        {
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
            // Requesting app must be identified via the X-App-Context header
            if (!TryGetPlatformApp(out var platformApp, serviceResponse)) return serviceResponse;

            // Get allowed user roles to manage
            var allowedRoles = _userManagementGuardService.GetAllowedRoleListToManageUser();

            // Try to get user to validate its existence. Mirrors the list query: the user is
            // manageable when they hold no role in the requesting app or when every app role
            // they hold is one the requester is allowed to manage.
            var user = await _userManager.Users
                .Include(i => i.UserRoles)
                .ThenInclude(i => i.Role)
                .Where(w =>
                    w.Id == accountUsersTableDto.Id &&
                    w.IsDefault == false &&
                    w.Id != _userId &&
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    !w.UserRoles.Any(ur =>
                        ur.Role != null &&
                        ur.Role.AppCode == platformApp.ToAppCode() &&
                        !allowedRoles.Contains(ur.Role.Name)))
                .SingleOrDefaultAsync();

            // User does not exist
            if (user == null)
            {
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // Convert roles FullName to Name (Frontend will return roles in "FullName" of IdentityRole. However userManger work with "Name" of IdentityRole
            var appRoles = await AccountUsersHelper.FetchAllRolesAsync(_roleManager);
            var toBeAddedUserRoles = AccountUsersHelper.TransformRoleFullNameToName(appRoles, accountUsersTableDto.UserRoles);

            // Only the requesting app's roles are assigned by this update
            var appRoleNameSet = AccountUsersHelper.GetAppRoleNames(appRoles, platformApp);
            var rolesToAssign = toBeAddedUserRoles.Where(w => appRoleNameSet.Contains(w)).ToList();

            // Roles of other apps may only be preserved as-is, never newly assigned or removed
            var currentRoleNames = user.UserRoles.Where(ur => ur.Role != null).Select(ur => ur.Role!.Name).ToList();
            var foreignRolesRequested = toBeAddedUserRoles.Where(w => !appRoleNameSet.Contains(w)).ToList();
            if (foreignRolesRequested.Any(w => !currentRoleNames.Contains(w, StringComparer.OrdinalIgnoreCase)))
            {
                serviceResponse.Message = "One or more roles do not belong to the requesting app";
                return serviceResponse;
            }

            // Request is not allowed to manage user role which is going to be added
            if (!_userManagementGuardService.IsAllowedToManageAccountsDbUser(rolesToAssign, accountUsersTableDto.Id))
            {
                // Message is already logged in IsAllowedToManageUser method
                serviceResponse.Message = "You're not allowed to manage user";
                return serviceResponse;
            }

            // Safety guard: if the user holds any app role the requester cannot manage, refuse
            // the update. This should already be enforced by the list filter, but rejecting here
            // prevents accidental data loss if that filter ever changes.
            var unmanagedAppRoles = currentRoleNames
                .Where(roleName => appRoleNameSet.Contains(roleName) && !allowedRoles.Contains(roleName, StringComparer.OrdinalIgnoreCase))
                .ToList();
            if (unmanagedAppRoles.Count > 0)
            {
                serviceResponse.Message = "You're not allowed to manage user";
                return serviceResponse;
            }

            // Keep the user's roles from other apps intact while replacing this app's roles
            var rolesAfterUpdate = rolesToAssign
                .Concat(currentRoleNames.Where(roleName => !appRoleNameSet.Contains(roleName)))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();

            // Validate user uniqueness - Not adding TenantId filter since email column is unqiue for whole table
            var userAlreadyExists = await _userManager.Users.AnyAsync(w =>
                                            w.Email.ToLower() == accountUsersTableDto.Email.ToLower() &&
                                            w.Id != accountUsersTableDto.Id);

            // User already exists
            if (userAlreadyExists)
            {
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
                return serviceResponse;
            }

            // Update user roles (M2M relationship)
            var updateUserRolesResult = await UpdateAccountUserRoles(user, rolesAfterUpdate);

            // Update user roles jab failed
            if (!updateUserRolesResult)
            {
                return serviceResponse;
            }

            // Persist the selected spaces to the SpaceUser table so the user's
            // space membership is reflected in the Users table.
            await AccountUsersHelper.SyncUserSpacesAsync(_unitOfWork, _currentTenantService, _logger, _userId, user.Id, accountUsersTableDto.Spaces);

            // Update user in other databases
            if (user.IsCreatedInOtherDbs)
            {
                // Try to update user in other databases
                var updateUserInOtherDbsResult = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(user, CrudTypesEnum.Update, _jwt);

                // Failed to update user in other databases
                if (!updateUserInOtherDbsResult) return serviceResponse;
            }

            // Return only the requesting app's roles so the response stays consistent with the list
            var updatedUserDto = user.Adapt<AccountUsersTableDto>();
            updatedUserDto.UserRoles = user.UserRoles
                .Where(ur => ur.Role != null && appRoleNameSet.Contains(ur.Role.Name))
                .Select(ur => ur.Role!.FullName!)
                .ToList();

            // Task successful
            serviceResponse.Data = updatedUserDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "User updated successfully";
        }
        catch
        {
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
            // Requesting app must be identified via the X-App-Context header
            if (!TryGetPlatformApp(out var platformApp, serviceResponse)) return serviceResponse;
            var appCode = platformApp.ToAppCode();

            // Get allowed user roles to manage
            var allowedRoles = _userManagementGuardService.GetAllowedRoleListToManageUser();

            // Try to get user to validate its existence. Mirrors the list query: the user is
            // manageable when they hold no role in the requesting app or when every app role
            // they hold is one the requester is allowed to manage.
            var user = await _userManager.Users
                .Include(i => i.UserRoles)
                .ThenInclude(i => i.Role)
                .Where(w =>
                    w.Id == id &&
                    w.IsDefault == false &&
                    w.Id != _userId &&
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    !w.UserRoles.Any(ur =>
                        ur.Role != null &&
                        ur.Role.AppCode == appCode &&
                        !allowedRoles.Contains(ur.Role.Name)))
                .SingleOrDefaultAsync();

            // User does not exist
            if (user == null)
            {
                serviceResponse.Message = "User does not exist";
                return serviceResponse;
            }

            // Delete user
            var deleteUserResult = await _userManager.DeleteAsync(user);

            // Delete-Job failed
            if (!deleteUserResult.Succeeded)
            {
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
        catch
        {
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
            // Requesting app must be identified via the X-App-Context header
            if (!TryGetPlatformApp(out var platformApp, serviceResponse)) return serviceResponse;

            // Get allowed user roles to manage
            var allowedRoles = _userManagementGuardService.GetAllowedRoleListToManageUser();

            // Get all roles of the requesting app after filteration
            var roles = await _roleManager.Roles
                .Where(w => allowedRoles.Contains(w.Name) && w.AppCode == platformApp.ToAppCode())
                .OrderBy(o => o.Seq)
                .ToListAsync();

            // Task successful
            serviceResponse.Data = roles.Adapt<IEnumerable<SelectOption>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Roles retrieved successfully";
        }
        catch
        {
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
        catch
        {
            return serviceResponse;
        }

        return serviceResponse;
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
        catch
        {
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
            // Requesting app must be identified via the X-App-Context header
            if (!TryGetPlatformApp(out var platformApp, serviceResponse)) return serviceResponse;
            var appCode = platformApp.ToAppCode();

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
                    w.UserRoles.Where(w1 => w1.Role != null && w1.Role.AppCode == appCode && allowedRoles.Contains(w1.Role.Name)).Select(s => s.UserId).Contains(w.Id))
                .ToListAsync();

            // Users do not exist
            if (users.Count == 0)
            {
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
        catch
        {
            return serviceResponse;
        }

        return serviceResponse;
    }
}