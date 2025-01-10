namespace AccountsAPIs.DTOs;

public class PaymentStatusDto
{
    /// <summary>
    /// Gets or sets the ID of the Payment
    /// </summary>
    public Guid Id {get;set;}

    /// <summary>
    /// Gets or sets the paymentStatus
    /// </summary>
    public string? PaymentStatus { get; set; }
}