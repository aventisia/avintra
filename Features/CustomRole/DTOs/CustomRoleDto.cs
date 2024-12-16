namespace AccountsAPIs.DTOs;

public class CustomRoleDto
{
    /// <summary>
    /// Gets or sets the Id of a role
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of a role
    /// </summary>
    public string FullName { get; set; }

    /// <summary>
    /// Gets or sets the short name of a role
    /// </summary>
    public string? ShortName { get; set; }

    /// <summary>
    /// Gets or sets the description for the role
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the role is disabled. 
    /// </summary>
    public bool IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the Id of the user who created the record.
    /// </summary>
    public Guid? CreatedByUserId { get; set; }
}