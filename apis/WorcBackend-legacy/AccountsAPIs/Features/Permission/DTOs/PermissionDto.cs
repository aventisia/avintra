namespace AccountsAPIs.DTOs;

public class PermissionDto
{

    /// <summary>
    /// Gets or sets the Id of a permission
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of a permission
    /// </summary>
    
    [MaxLength(50)]
    public required string Name { get; set;}

    /// <summary>
    /// Gets or sets the description for the permission
    /// </summary>
    
    [MaxLength(500)]
    public string? Description { get; set;}

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