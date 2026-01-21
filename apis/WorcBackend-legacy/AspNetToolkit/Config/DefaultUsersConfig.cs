namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for the default users.
/// </summary>
public class DefaultUserConfig
{
    /// <summary>
    /// Gets or sets the email of the default user.
    /// </summary>
    public required string Email { get; set; }

    /// <summary>
    /// Gets or sets the first name of the default user.
    /// </summary>
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the last name of the default user.
    /// </summary>
    public required string LastName { get; set; }
}
