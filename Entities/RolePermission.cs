namespace AccountsAPIs.Entities;

public class RolePermission: BaseEntity
{
    public required Guid AccountRoleId { get; set;}

    [ForeignKey("AccountRoleId")]
    public virtual AccountRole? AccountRole{ get; set;}

    public required Guid PermissionId { get; set;}

    [ForeignKey("PermissionId")]
    public virtual Permission? Permission{ get; set;}
    
}