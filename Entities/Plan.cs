
namespace WorkspaceAPIs.Entities;


public class Plan : BaseEntity, IMustHaveTenant
{
    public Guid TenantId { get; set; }

    public virtual ICollection<Subscription>? Subscriptions{ get; set; }
}