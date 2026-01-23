namespace AccountsAPIs.Enums;

/// <summary>
/// Enumeration of supported authentication providers for external logins.
/// </summary>
public enum ExternalAuthProviderEnum
{
    /// <summary>
    /// Represents authentication through Azure Active Directory.
    /// </summary>
    Azure,

    /// <summary>
    /// Represents authentication through Google Account.
    /// </summary>
    Google,

    /// <summary>
    /// Represents authentication through Facebook.
    /// </summary>
    Facebook,

    /// <summary>
    /// Represents authentication through Twitter.
    /// </summary>
    Twitter
}