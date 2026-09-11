namespace AspNetToolkit.Services;

public interface IUserManagementGuardService
{
    /// <summary>
    /// Retrieves the list of allowed roles to manage a user for the requesting platform app.
    /// </summary>
    /// <remarks>
    /// Note: The requesting app is taken from the X-App-Context header (workspace when absent).
    /// The manageable roles for each manager role are listed explicitly in the implementation,
    /// so supporting a new manager role is a one-line change there.
    /// </remarks>
    /// <returns>A list of strings representing the allowed roles which current user can assign.</returns>
    List<string> GetAllowedRoleListToManageUser();

    /// <summary>
    /// Checks if the current user is allowed to manage the accounts database user.
    /// </summary>
    /// <param name="userRoles">The roles of the user (to be managed user).</param>
    /// <param name="userId">The Id of the user (to be managed user).</param>
    /// <returns>True if the current user is allowed, false otherwise.</returns>
    bool IsAllowedToManageAccountsDbUser(List<string> userRoles, Guid userId);

    /// <summary>
    /// Determines whether the current user is allowed to manage other database (Workspace or Internal etc) users. <br/>
    /// </summary>
    /// <remarks>
    /// Note: We cannot add admin roles to [Authorize] attribute to manage this since the user himself/herself will be managing their own account.
    /// </remarks>
    /// <param name="userId">The Id of the user (to be managed user).</param>
    /// <returns>True if the current user is allowed, false otherwise.</returns>
    bool IsAllowedToManageOtherDbUser(Guid userId);

    /// <summary>
    /// Checks if the current user has a specific role based on their claims.
    /// </summary>
    /// <param name="role">The role to check for (e.g., "SA", "TA").</param>
    /// <returns>True if the current user has the specified role, false otherwise.</returns>
    bool HasRole(string role);
}