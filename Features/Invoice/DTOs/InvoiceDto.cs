namespace AccountsAPIs.DTOs;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public Guid SubscriptionId { get; set; } 
    public decimal Amount { get; set; }
    public DateTime GeneratedDate { get; set; }
    public bool IsPaid { get; set; }
}