namespace AccountsAPIs.DTOs;

public class InvoiceDto
{
    /// <summary>
    /// Gets or sets the ID of the Invoice with Payment is associated with.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the Id of a payment with subscription is associated with.
    /// </summary>
    public Guid SubscriptionId { get; set; }
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
}