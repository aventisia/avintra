namespace AspNetToolkit.Services;

/// <summary>
/// Implementation of IPermissionValidator that validates permissions against user claims.
/// </summary>
public class PermissionValidator : IPermissionValidator
{
    private readonly List<Claim> permissionClaims;
    private readonly ILogger<PermissionValidator> logger;

    public PermissionValidator(IHttpContextAccessor httpContextAccessor, ILogger<PermissionValidator> logger)
    {
        // Retrieve the claims from the HttpContext
        permissionClaims = httpContextAccessor.HttpContext?.User?.Claims
                .Where(c => c.Type == "permissions") // Filter to only permission claims
                .ToList() ?? new List<Claim>();

        this.logger = logger;
    }

    // Validates whether the requested permission and access level are granted to the user.
    public bool ValidatePermission(PermissionTypesEnum requestedPermission, PermissionAccessTypesEnum requestedAccess)
    {
        var permissionKey = requestedPermission.ToString();
        logger.LogInformation("Validating permission: {PermissionKey} for access: {RequestedAccess}", permissionKey, requestedAccess);

        var claim = permissionClaims.FirstOrDefault(c => c.Type == "permissions" && c.Value.Contains(permissionKey));

        if (claim == null)
        {
            logger.LogWarning("Permission {PermissionKey} not found in claims.", permissionKey);
            return false; // Permission not found
        }

        // Extracting the accesses from the claim value
        var accesses = ExtractAccessLevels(claim.Value, permissionKey);
        var requestedAccessValue = (int)requestedAccess;

        // Check for full access (0)
        if (accesses.Contains(0))
        {
            logger.LogInformation("Full access granted for permission: {PermissionKey}.", permissionKey);
            return true; // Full access granted
        }

        // Check for specific access level
        if (accesses.Contains(requestedAccessValue))
        {
            logger.LogInformation("Access level {RequestedAccess} granted for permission: {PermissionKey}.", requestedAccess, permissionKey);
            return true; // Access is granted
        }

        logger.LogWarning("Access level {RequestedAccess} denied for permission: {PermissionKey}.", requestedAccess, permissionKey);
        return false; // Access is denied
    }

    // Extracts the list of access levels from the claim value.
    private List<int> ExtractAccessLevels(string claimValue, string permissionKey)
    {
        // Assuming the format is "{ Permission = Client, Accesses = [4,1] }"
        var accessesPart = claimValue.Substring(claimValue.IndexOf("Accesses = ") + 11);
        accessesPart = accessesPart.Trim(new char[] { ' ', '}', ']' }); // Clean up the string
        accessesPart = accessesPart.Replace("[", "").Replace("]", ""); // Remove brackets
        var accesses = accessesPart.Split(',')
                                    .Select(int.Parse)
                                    .ToList();

        logger.LogInformation("Extracted accesses for permission {PermissionKey}: {Accesses}", permissionKey, string.Join(", ", accesses));
        return accesses;
    }
}