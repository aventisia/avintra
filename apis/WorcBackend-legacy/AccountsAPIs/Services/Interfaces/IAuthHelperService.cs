namespace AccountsAPIs.Services;

/// <summary>
/// Represents a service that provides authentication helper methods.
/// </summary>
public interface IAuthHelperService
{
    /// <summary>
    /// Validates the null, disabled, and expired status of a tenant.
    /// </summary>
    /// <param name="tenant">The tenant to validate.</param>
    /// <param name="userName">The username of the user.</param>
    /// <returns>A boolean value indicating whether the tenant is valid or not.</returns>
    bool IsUserTenantValid(Tenant tenant, string userName);

    /// <summary>
    /// Returns the sign-in rejection message for a disabled, deactivated or tenant-invalid account, or null when the account may sign in.
    /// </summary>
    /// <param name="user">The user account to validate.</param>
    /// <returns>The rejection message, or null when the account may sign in.</returns>
    string? GetSignInBlockMessage(AccountUser user);

    /// <summary>
    /// Checks if the new password passes the obsolete password policy.
    /// </summary>
    /// <param name="newPwd">The new password to check.</param>
    /// <param name="user">The user account.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a boolean value indicating whether the new password passes the policy or not.</returns>
    Task<bool> DoesNewPwdPassObsoletePwdPolicy(string newPwd, AccountUser user);

    /// <summary>
    /// Saves the password in the obsolete password list.
    /// </summary>
    /// <param name="user">The user account.</param>
    /// <param name="pwdToBeSaved">The password to be saved.</param>
    /// <param name="pwdSetOn">The date and time when the password was set.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a boolean value indicating whether the password was saved successfully or not.</returns>
    Task<bool> SavePwdInObsoletePwdList(AccountUser user, string pwdToBeSaved, DateTimeOffset pwdSetOn);

    /// <summary>
    /// Deletes all expired and active verification codes for the provided username and user agent.
    /// </summary>
    /// <param name="userName">The username of the user.</param>
    /// <param name="userAgent">The user agent.</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains a boolean value indicating whether the verification codes were deleted successfully or not.</returns>
    Task<bool> DeleteVerificationCodes(string userName, string userAgent);

    /// <summary>
    /// Creates a JSON Web Token (JWT) for a user session or a single user.
    /// </summary>
    /// <param name="user">The user account.</param>
    /// <param name="jwtExpiresOn">The expiration date and time of the JWT.</param>
    /// <param name="isSingleUseJwt">A boolean value indicating whether the JWT is single-use or not. Default is false.</param>
    /// <param name="sessionId">The ID of the session. Default is null.</param>
    /// <param name="currentPlan">The user's current subscription plan. Optional.</param>
    /// <returns>The created JWT as a string.</returns>
    string CreateJwt(AccountUser user, DateTimeOffset jwtExpiresOn, bool isSingleUseJwt = false, Guid? sessionId = null, string? currentPlan = null);

    /// <summary>
    /// Creates a random refresh token.
    /// </summary>
    /// <returns>The created refresh token as a string.</returns>
    string CreateRefreshToken();

    /// <summary>
    /// Sets a cookie with the specified name, value, expiry, and subpath.
    /// </summary>
    /// <param name="name">The name of the cookie.</param>
    /// <param name="value">The value of the cookie.</param>
    /// <param name="expiry">The expiration date and time of the cookie. Default is null.</param>
    /// <param name="subPath">The subpath of the cookie. Default is null.</param>
    void SetCookie(string name, string value, DateTimeOffset? expiry = null, string? subPath = null);

    /// <summary>
    /// Removes a cookie with the specified name.
    /// </summary>
    /// <param name="name">The name of the cookie to remove.</param>
    /// <param name="subPath">The subpath of the cookie. Default is null.</param>
    void RemoveCookie(string name, string? subPath = null);

    /// <summary>
    /// Creates or updates a user in other databases asynchronously.
    /// </summary>
    /// <param name="accountUser">The account user object.</param>
    /// <param name="crudType">The CRUD operation type.</param>
    /// <param name="jwt">The JSON Web Token.</param>
    /// <returns>A task representing the asynchronous operation. The task result is a boolean indicating whether the operation was successful.</returns>
    Task<bool> CreateOrUpdateUserInOtherDbsAsync(AccountUser accountUser, CrudTypesEnum crudType, string jwt);

    /// <summary>
    /// Deletes a user from other databases asynchronously.
    /// </summary>
    /// <param name="userId">The ID of the user to delete.</param>
    /// <param name="jwt">The JSON Web Token for authentication.</param>
    /// <returns>A task representing the asynchronous operation. The task result is a boolean indicating whether the user was successfully deleted.</returns>
    Task<bool> DeleteUserInOtherDbsAsync(Guid userId, string jwt);
}