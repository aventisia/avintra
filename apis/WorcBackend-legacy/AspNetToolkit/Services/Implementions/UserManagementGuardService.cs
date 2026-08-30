namespace AspNetToolkit.Services;

public class UserManagementGuardService : IUserManagementGuardService
{
    private readonly ILogger<UserManagementGuardService> _logger;
    private readonly Guid _userId;
    private readonly string _userName;
    private readonly List<string> _userRoles;


    public UserManagementGuardService(
        ILogger<UserManagementGuardService> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;

        // Set _userId, _userName and _userRoles
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
        _userRoles = httpContextAccessor.HttpContext?.User?.Claims?.Where(c => c.Type == ClaimTypes.Role).Select(s => s.Value).ToList() ?? new List<string>();
    }

    // Retrieves the list of allowed roles to manage a user.
    public List<string> GetAllowedRoleListToManageUser()
    {
        // Get current user's top level role. FirstOrDefault is enough since we are already sorting the roles in ascending order while creating the Jwt
        var currentUserTopRole = _userRoles.FirstOrDefault();

        // Get allowed roles list based on current user's top level role
        var allowedRolesList = new List<string>();
        switch (currentUserTopRole)
        {
            case "SA":
                allowedRolesList = Enum.GetValues(typeof(CustomRolesEnum)).Cast<CustomRolesEnum>().Select(s => s.ToString()).ToList();
                break;
            case "TA":
                allowedRolesList = new List<string>() { "TA", "OM", "TD", "TU", };
                break;
        }

        return allowedRolesList;
    }

    // Checks if the current user is allowed to manage the accounts database user.
    public bool IsAllowedToManageAccountsDbUser(List<string> userRoles, Guid userId)
    {
        // Get allowed roles list based on current user's top level role
        var allowedRolesList = GetAllowedRoleListToManageUser();

        // Check if any of the roles in the request is not allowed to manage
        foreach (var role in userRoles)
        {
            if (!allowedRolesList.Contains(role))
            {
                return false;
            }
        }

        // If everything is fine, return true
        return true;
    }

    // Determines whether the current user is allowed to manage other database (Workspace or Internal etc) users.
    public bool IsAllowedToManageOtherDbUser(Guid userId)
    {
        // current UserId value and userId to manage matching (means User himself/herself trying to manage his/her account)
        if (_userId == userId) return true;

        // Try to get allowed roles list based on current user's top level role
        var allowedRolesList = GetAllowedRoleListToManageUser();

        // If list is empty then it means current user does not belong to following Roles: SA,GA,GSA,TA,TSA
        if (allowedRolesList.Count == 0)
        {
            return false;
        }

        // If everything is fine, return true
        return true;
    }

    /// <summary>
    /// Checks if the current user has a specific role based on their claims.
    /// </summary>
    /// <param name="role">The role to check for.</param>
    /// <returns>True if the user has the specified role, otherwise false.</returns>
    public bool HasRole(string role)
    {
        return _userRoles.Contains(role, StringComparer.OrdinalIgnoreCase);
    }
}