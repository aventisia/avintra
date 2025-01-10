namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object for updating the first name and last name of a user account.
/// </summary>
public class NameUpdateDto
{
    /// <summary>
    /// Gets or sets the first name of the user. Max-50.
    /// </summary>
    [StringLength(50)]
    public required string FirstName { get; set; }

    /// <summary>
    /// Gets or sets the last name of the user. Max-50.
    /// </summary>
    [StringLength(50)]
    public required string LastName { get; set; }
    
}