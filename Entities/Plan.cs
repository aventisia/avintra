
namespace AccountsAPIs.Entities;


public class Plan : BaseEntity
{
    public Guid TenantId { get; set; }

    public virtual ICollection<Subscription>? Subscriptions{ get; set; }
}