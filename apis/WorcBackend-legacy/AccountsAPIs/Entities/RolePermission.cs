namespace AccountsAPIs.Entities;

public class RolePermission : BaseEntity
{
    public required Guid AccountRoleId { get; set; }

    [ForeignKey("AccountRoleId")]
    public virtual AccountRole? AccountRole { get; set; }

    public required Guid PermissionId { get; set; }

    [ForeignKey("PermissionId")]
    public virtual Permission? Permission { get; set; }

    /// <summary>
    /// Gets or sets the access granted by this permission for the role.
    /// </summary>
    public required PermissionAccessTypesEnum Access { get; set; }

}