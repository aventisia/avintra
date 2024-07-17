using AccountsAPIs.DTOs;

namespace AccountsAPIs.Services;

public class AccountUsersTableService : IAccountUsersTableService
{
    private readonly UserManager<AccountUser> _userManager;
    private readonly RoleManager<AccountRole> _roleManager;
    private readonly ILogger<AccountUsersTableService> _logger;
    private readonly IMapper _mapper;
    private readonly IAuthHelperService _authHelperService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly string _jwt;
    private readonly Guid _userId;

    public AccountUsersTableService(
        UserManager<AccountUser> userManager,
        RoleManager<AccountRole> roleManager,
        ILogger<AccountUsersTableService> logger,
        IMapper mapper,
        IAuthHelperService authHelperService,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _jwt, _userId and _userRoles
        _jwt = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? "jwt-not-found";
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
        _mapper = mapper;
        _authHelperService = authHelperService;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
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
                .ProjectTo<AccountUsersTableDto>(_mapper.ConfigurationProvider)
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Task successful
            serviceResponse.Data = _mapper.Map<IEnumerable<AccountUsersTableDto>>(users);
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

            // Check if user can have "AE" role
            var canUserHaveAventisiaEmployeeRoleResult = CanUserHaveAventisiaEmployeeRole(accountUsersTableDto.Email, toBeAddedUserRoles);
            if (canUserHaveAventisiaEmployeeRoleResult != null)
            {
                serviceResponse.Message = canUserHaveAventisiaEmployeeRoleResult;
                return serviceResponse;
            }

            // Trim dto' string props
            accountUsersTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(accountUsersTableDto);

            // Default mapping - keep UserRoles prop name different in dto to avoid error at the time of mapping 
            var newUser = _mapper.Map<AccountUser>(accountUsersTableDto);
            newUser.Id = Guid.NewGuid();
            newUser.UserName = accountUsersTableDto.Email.ToLower();
            newUser.TenantId = _currentTenantService.CurrentTenantId; // DO NOT CHANGE THIS
            newUser.EmailConfirmed = false; // DO NOT CHANGE THIS
            newUser.CreatedByUserId = _userId;
            newUser.LastModifiedByUserId = _userId;

            // Additional mapping
            newUser.IsDefault = false; // DO NOT CHANGE THIS
            newUser.IsEditable = true; // DO NOT CHANGE THIS

            // Try to add user in other databases
            var createUserInOtherDbsResult = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(newUser, CrudTypesEnum.Create, _jwt, toBeAddedUserRoles.Contains("AE"));

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

            // Task successful
            serviceResponse.Data = _mapper.Map<AccountUsersTableDto>(newUser);
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

            // Check if user can have "AE" role
            var canUserHaveAventisiaEmployeeRoleResult = CanUserHaveAventisiaEmployeeRole(accountUsersTableDto.Email, toBeAddedUserRoles);
            if (canUserHaveAventisiaEmployeeRoleResult != null)
            {
                serviceResponse.Message = canUserHaveAventisiaEmployeeRoleResult;
                return serviceResponse;
            }

            // Get old roles of user  (required to compare with new roles to see if AE role has been removed or not)
            var userOldRoles = user.UserRoles.Select(s => s.Role.Name).ToList();

            // Trim dto' string props
            accountUsersTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(accountUsersTableDto);

            // Has email changed? (Note: Check before auto mapping)
            var hasEmailChanged = user.Email.ToLower() == accountUsersTableDto.Email.ToLower();

            // Default mapping 
            _mapper.Map(accountUsersTableDto, user);
            user.EmailConfirmed = hasEmailChanged;
            user.UserName = accountUsersTableDto.Email.ToLower();
            user.LastModifiedByUserId = _userId;
            user.LastModifiedOn = DateTimeOffset.UtcNow;
            user.IsDisabled = accountUsersTableDto.IsDisabled ?? user.IsDisabled;

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

            // Update user in other databases
            if (user.IsCreatedInOtherDbs)
            {
                // Try to update user in other databases
                var updateUserInOtherDbsResult = await _authHelperService.CreateOrUpdateUserInOtherDbsAsync(user, CrudTypesEnum.Update, _jwt, toBeAddedUserRoles.Contains("AE"));

                // Failed to update user in other databases
                if (!updateUserInOtherDbsResult) return serviceResponse;
            }

            // Delete user from InternalDb if user had AE role and now it is removed
            if (user.IsCreatedInOtherDbs && userOldRoles.Contains("AE") && !toBeAddedUserRoles.Contains("AE"))
            {
                // Try to delete user from InternalDb
                var deleteUserInInternalDbResult = await _authHelperService.DeleteUserInInternalDbAsync(user.Id, _jwt);

                // Failed to delete user from InternalDb
                if (!deleteUserInInternalDbResult) return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = _mapper.Map<AccountUsersTableDto>(user);
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
            var deleteUserInOtherDbsResult = await _authHelperService.DeleteUserInOtherDbsAsync(id, _jwt, userRoleNames.Contains("AE"));

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
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetAccountRolesAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
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
            serviceResponse.Data = _mapper.Map<IEnumerable<SelectOptionDto>>(roles);
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

    // HelperFn: Transform roles "FullName" to "Name". Frontend will return roles in "FullName" of IdentityRole. However userManger work with "Name" of IdentityRole
    private async Task<List<string>> TransformRoleFullNameToName(List<string> rolesToTransform)
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
            return new List<string>();
        }
    }

    // HelperFn: Check if user can have "AE" role
    private string? CanUserHaveAventisiaEmployeeRole(string email, List<string> toBeAddedUserRoles)
    {
        // Check for mandatory "AE" role for "@aventisia.com" domain
        var isAventisiaEmail = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(email) == "aventisia.com";
        if (isAventisiaEmail && !toBeAddedUserRoles.Contains("AE"))
        {
            _logger.LogInformation($"AVENTISIA Employee (AE) role is mandatory for aventisia.com email domain. Requested email: {email}");
            return "AVENTISIA Employee role is mandatory for aventisia.com email domain";
        }

        // Stop from using "AE" role for domains other than "@aventisia.com"
        if (!isAventisiaEmail && toBeAddedUserRoles.Contains("AE"))
        {
            _logger.LogInformation($"AVENTISIA Employee (AE) role cannot be used for other domains. Requested email: {email}");
            return "AVENTISIA Employee role cannot be used for other domains";
        }

        // Return null if no issue
        return null;
    }
}