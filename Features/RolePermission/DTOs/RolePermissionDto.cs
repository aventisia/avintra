namespace AccountsAPIs.DTOs;

public class RolePermissionDto
{   
    /// <summary>
    /// Gets or sets the Id of a role permission
    /// </summary>
    public Guid Id { get; set; }
    /// <summary>
    /// Gets or sets primary key of custom role record
    /// </summary>
    public required Guid CustomRoleId { get; set;}

    /// <summary>
    /// Gets or sets primary key of permission record
    /// </summary>
    public required Guid PermissionId { get; set;}

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