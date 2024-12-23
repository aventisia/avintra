namespace AccountsAPIs.DTOs;

public class PaymentDto
{
    public Guid Id {get;set;}
    public Guid InvoiceId {get;set;}
    public decimal AmountPaid { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? PaymentMethod { get; set; }
     public string? PaymentStatus { get; set; }
}