namespace AspNetToolkit.Services;

/// <summary>
/// Interface for validating user permissions.
/// This interface defines a method to validate whether a user has the specified permissions and access levels.
/// </summary>
public interface IPermissionValidator
{
    /// <summary>
    /// Validates the requested permission against the user's access level.
    /// </summary>
    /// <param name="requestedPermission">The type of permission being requested.</param>
    /// <param name="requestedAccess">The access level associated with the permission.</param>
    /// <returns>True if the permission is valid for the given access level; otherwise, false.</returns>
    bool ValidatePermission(PermissionTypesEnum requestedPermission, PermissionAccessTypesEnum requestedAccess);
}