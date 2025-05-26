namespace AspNetToolkit.Config;

/// <summary>
/// Represents the configuration for the default users.
/// </summary>
public class DefaultUsersConfig
{
    /// <summary>
    /// Gets or sets the default super user for the "Aventisia Technologies Private Limited" tenant
    /// </summary>
    public required DefaultUser SuperUser { get; set; }

    /// <summary>
    /// Gets or sets the default user for the "Individual Users" tenant
    /// </summary>
    public required DefaultUser IndividualUser { get; set; }
}

/// <summary>
/// Represents a default user.
/// </summary>
public class DefaultUser
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

    /// <summary>
    /// Gets or sets the list of roles for the default user.
    /// </summary>
    public required List<string> Roles { get; set; }
}
