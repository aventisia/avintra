namespace AccountsAPIs.Entities;

public class Payment :BaseEntity,IMustHaveTenant
{
    [Key]
    public Guid Id {get;set;}
    public Guid TenantId {get; set;}
    public Guid InvoiceId {get;set;}
    [ForeignKey("InvoiceId")]
    public virtual Invoice? Invoice {get;set;}
     public decimal AmountPaid { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? PaymentMethod { get; set; }
    public string? PaymentStatus { get; set; }


}