namespace AccountsAPIs.DTOs;

public class InvoiceDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the invoice.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated pricing plan.
    /// </summary>
    public Guid PricingPlanId { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the license credit associated with this invoice.
    /// </summary>
    public Guid LicenseCreditId { get; set; }

    /// <summary>
    /// Gets or sets the base amount of the invoice before taxes and discounts.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Gets or sets the date when the invoice was generated.
    /// </summary>
    public DateTime GeneratedDate { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the invoice has been paid.
    /// </summary>
    public bool IsPaid { get; set; }

    /// <summary>
    /// Gets or sets the date when the payment was received.
    /// </summary>
    public DateTime AmountReceivedOn { get; set; }

    /// <summary>
    /// Gets or sets the invoice number.
    /// </summary>
    public string? InvoiceNumber { get; set; }

    /// <summary>
    /// Gets or sets the tax amount applied to the invoice.
    /// </summary>
    public decimal Tax { get; set; }

    /// <summary>
    /// Gets or sets the discount amount applied to the invoice.
    /// </summary>
    public decimal Discount { get; set; }

    /// <summary>
    /// Gets or sets the total amount after applying tax and discount.
    /// </summary>
    public decimal TotalAmount { get; set; }

    /// <summary>
    /// Gets or sets the due date for the invoice payment.
    /// </summary>
    public DateTime DueDate { get; set; }

    /// <summary>
    /// Gets or sets the status of the invoice (e.g., "unpaid", "paid").
    /// </summary>
    public string? Status { get; set; }
}
