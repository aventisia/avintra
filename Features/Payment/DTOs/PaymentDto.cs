namespace AccountsAPIs.DTOs;

public class PaymentDto
{
    /// <summary>
    /// Gets or sets the ID of the Payment
    /// </summary>
    public Guid Id {get;set;}

    /// <summary>
    /// Gets or sets the Id of a payment with invoice is associated with.
    /// </summary>
    public Guid InvoiceId {get;set;}

    /// <summary>
    /// Gets or sets the amountPaid
    /// </summary>
    public decimal AmountPaid { get; set; }

    /// <summary>
    /// Gets or sets the paymentDate
    /// </summary>
    public DateTime PaymentDate { get; set; }

    /// <summary>
    /// Gets or sets the paymentMethod
    /// </summary>
    public PaymentMethodEnum PaymentMethod { get; set; }

    /// <summary>
    /// Gets or sets the paymentStatus
    /// </summary>
    public PaymentStatusEnum PaymentStatus { get; set; }
    [MaxLength(20)]
    public string? TransactionId {get;set;}
    [MaxLength(20)]
    public string? UTRNumber {get;set;}
    
    [MaxLength(25)]
    public string? GatewayName { get; set; }
}