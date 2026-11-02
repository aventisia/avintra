namespace GlobalAdminAPIs.Enums;

/// <summary>
/// Represents the names of cookies used in the application.
/// </summary>
public enum CookieNamesEnum
{
    /// <summary>
    /// Represents the name of the session ID cookie.
    /// </summary>
    SessionId,

    /// <summary>
    /// Represents the access token (JWT) cookie name.
    /// </summary>
    AccessToken,

    /// <summary>
    /// Represents the name of the refresh token cookie.
    /// </summary>
    RefreshToken,

    /// <summary>
    /// Represents the name of the userName cookie.
    /// </summary>
    UserName
}