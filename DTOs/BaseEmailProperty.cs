namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents a base class for email properties.
/// </summary>
public abstract class BaseEmailProperty
{
    /// <summary>
    /// Gets or sets the user's email/username.
    /// </summary>
    [EmailAddress]
    public virtual required string Email { get; set; }
}