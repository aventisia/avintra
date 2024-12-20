namespace AccountsAPIs.Entities;

public class Invoice
{
    [Key]
    public Guid Id { get; set; }
    public Guid SubscriptionId { get; set; } 
    [ForeignKey("SubscriptionId")]
    public virtual Subscription? Subscription { get; set; } 
    public decimal Amount { get; set; }
    public DateTime GeneratedDate { get; set; }
    public bool IsPaid { get; set; }
}