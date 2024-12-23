namespace AccountsAPIs.Entities;

public class Permission: BaseEntity
{
    /// <summary>
    /// Gets or sets the name of a permission
    /// </summary>
    
    [MaxLength(50)]
    public string Name { get; set;}

    /// <summary>
    /// Gets or sets the description for the permission
    /// </summary>
    
    [MaxLength(500)]
    public string? Description { get; set;}

    /// <summary>
    /// Gets or sets the list of role permissions associated with the user's custom role.
    /// </summary>
    public virtual ICollection<RolePermission>? RolePermissions { get; set;}

}