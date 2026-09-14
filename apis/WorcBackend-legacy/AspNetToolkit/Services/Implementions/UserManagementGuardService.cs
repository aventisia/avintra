namespace AspNetToolkit.Services;

public class UserManagementGuardService : IUserManagementGuardService
{
    private readonly ILogger<UserManagementGuardService> _logger;
    private readonly Guid _userId;
    private readonly string _userName;
    private readonly List<string> _userRoles;
    private readonly string? _appContextHeader;


    public UserManagementGuardService(
        ILogger<UserManagementGuardService> logger,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;

        // Set _userId, _userName and _userRoles
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";
        _userRoles = httpContextAccessor.HttpContext?.User?.Claims?.Where(c => c.Type == ClaimTypes.Role).Select(s => s.Value).ToList() ?? new List<string>();

        // Set the raw X-App-Context header value. Used to scope the allowed roles to the requesting app.
        _appContextHeader = httpContextAccessor.HttpContext?.Request.Headers[PlatformAppHeaderUtil.HeaderName].FirstOrDefault();
    }

    // Retrieves the list of allowed roles to manage a user for the requesting platform app.
    // The role each manager can assign is decided explicitly below: a manager gets their own role
    // and every less privileged role of the same app (a super admin is the exception and gets every
    // role). Adding or removing a manager role later is a one-line change here, so the rules stay
    // easy to read and maintain.
    public List<string> GetAllowedRoleListToManageUser()
    {
        // Determine the requesting app from the X-App-Context header. Defaults to workspace when absent.
        var platformApp = PlatformAppHeaderUtil.TryParseAppCode(_appContextHeader, out var parsedPlatformApp)
            ? parsedPlatformApp
            : PlatformAppsEnum.Workspace;

        // Enum.IsDefined guards against numeric/unknown claim values that Enum.TryParse would accept.
        var parsedUserRoles = _userRoles
            .Select(roleName => Enum.TryParse<CustomRolesEnum>(roleName, ignoreCase: true, out var role) && Enum.IsDefined(role)
                ? role
                : (CustomRolesEnum?)null);

        // Super admin is app-agnostic: when the user holds SA it is always the top role, so it is
        // resolved before (and without) the per-app lookup below. Only when SA is absent do we fall
        // back to finding the top role of the requesting app. The first match is enough since the JWT
        // orders a user's roles by Seq (ascending), and each app's roles restart at 0.
        var currentUserTopRole = parsedUserRoles.FirstOrDefault(role => role == CustomRolesEnum.SA)
            ?? parsedUserRoles.FirstOrDefault(role => role.HasValue && role.Value.ToPlatformApp() == platformApp);

        // No role of the requesting app means the user cannot manage any of its roles
        if (!currentUserTopRole.HasValue) return new List<string>();

        // Explicit role rules per manager role. Each entry lists exactly which roles of the
        // requesting app that manager may assign. To add a new manager role in future, add a case
        // below and list its manageable roles; no other code needs to change.
        var allowedRolesList = currentUserTopRole.Value switch
        {
            // Workspace: super admin manages every role defined in the system; tenant admin manages itself and below
            CustomRolesEnum.SA => Enum.GetValues(typeof(CustomRolesEnum)).Cast<CustomRolesEnum>().ToList(),
            CustomRolesEnum.TA => new List<CustomRolesEnum> { CustomRolesEnum.TA, CustomRolesEnum.OM, CustomRolesEnum.TD, CustomRolesEnum.TU },

            // CRM: super admin manages every CRM role; tenant admin manages itself and below
            CustomRolesEnum.CSA => new List<CustomRolesEnum> { CustomRolesEnum.CSA, CustomRolesEnum.CTA, CustomRolesEnum.CSR, CustomRolesEnum.CRP },
            CustomRolesEnum.CTA => new List<CustomRolesEnum> { CustomRolesEnum.CTA, CustomRolesEnum.CSR, CustomRolesEnum.CRP },

            // Any other role cannot manage users
            _ => new List<CustomRolesEnum>(),
        };

        return allowedRolesList.Select(role => role.ToString()).ToList();
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