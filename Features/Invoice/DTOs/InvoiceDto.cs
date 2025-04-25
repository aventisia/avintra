namespace AccountsAPIs.DTOs;

public class InvoiceDto
{
    /// <summary>
    /// Gets or sets the ID of the Invoice with Payment is associated with.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the PricingPlanId of a payment with pricing plan is associated with.
    /// </summary>
    public Guid PricingPlanId { get; set; }
    
    /// <summary>
    /// Gets or sets the Amount
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or sets the GeneratedDate
    /// </summary>
    public DateTime GeneratedDate { get; set; }

    /// <summary>
    /// Gets or sets the IsPaid
    /// </summary>
    public bool IsPaid { get; set; }

    /// <summary>
    /// Gets or sets the AmountReceivedOn
    /// </summary>
    public DateTime AmountReceivedOn { get; set; }

    public string? InvoiceNumber {get;set;}
    //public DateTime InvoiceDate {get;set;}
    public decimal Tax { get; set; }
    public decimal Discount { get; set; }
    public decimal TotalAmount  {get;set;}
    public DateTime DueDate {get;set;}
    public string? Status {get;set;}   //"unpaid",paid
}