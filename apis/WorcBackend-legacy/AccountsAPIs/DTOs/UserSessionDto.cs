namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a user session object that is sent on successful login or refresh token.
/// </summary>
public class UserSessionDto
{
    /// <summary>
    /// Gets or sets the tenant's full name. Max-100.
    /// </summary>
    public required string TenantName { get; set; }

    /// <summary>
    /// Gets or sets the user's first name. Max-50.
    /// </summary>
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name. Max-50.
    /// </summary>
    public required string LastName { get; set; }

    /// <summary>
    /// Gets or sets the 2-character long user name's initials. Max-2.
    /// </summary>
    public required string UserInitials { get; set; }

    /// <summary>
    /// Gets or sets the JWT used to extract user data and send it in the Authorization Header as Bearer if the client does not support cookies.
    /// </summary>
    public required string AccessToken { get; set; }

    /// <summary>
    /// Gets or sets the token used to get a new JWT.
    /// </summary>
    public required string RefreshToken { get; set; }

    /// <summary>
    /// Gets or sets the date when the refresh token expires.
    /// </summary>
    public required DateTimeOffset RTExpiresOn { get; set; }

    /// <summary>
    /// Gets or sets the user's country. 
    /// </summary>
    public required string Country { get; set; }

    /// <summary>
    /// Gets or sets the tenant type, or "NA" without a tenant.
    /// </summary>
    public required string TenantType { get; set; }

    /// <summary>
    /// Gets or sets whether the tenant still has to save the organization profile that sign-up deferred.
    /// </summary>
    public bool IsTenantSetupPending { get; set; }

    public required string PlatformVersion { get; set; }

    /// <summary>
    /// Gets or sets whether the tenant's active subscription is a paid (priced) plan.
    /// </summary>
    public bool HasPaidPlan { get; set; }
}