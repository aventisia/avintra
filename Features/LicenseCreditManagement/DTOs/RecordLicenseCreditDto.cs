namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a data transfer object that contains details about a tenant's licensing credits, 
/// including allocation, consumption, billing information, and tenant metadata.
/// This object is used to request or approve license credits for tenants.
/// </summary>
public class RecordLicenseCreditDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the related license credit.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Represents the type of pricing component (e.g., AI Agent, GPU Compute).
    /// </summary>
    [Required]
    public required Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the number of additional units requested for the tenant's licensing credits.
    /// </summary>
    public int AdditionalUnitsRequested { get; set; }

    /// <summary>
    /// The date on which the payment was received.
    /// </summary>
    [Required]
    public required DateTime DateReceived { get; set; }

    /// <summary>
    /// The total amount received from the tenant.
    /// </summary>
    [Required]
    public required decimal AmountReceived { get; set; }

    /// <summary>
    /// The variance percentage in payment received vs expected.
    /// </summary>
    public decimal Variance { get; set; }

    /// <summary>
    /// The remaining balance due after payment.
    /// </summary>
    public decimal BalanceDue { get; set; }

    /// <summary>
    /// Indicates whether the remaining dues should be written off.
    /// </summary>
    public bool WriteOffRemainingDues { get; set; }
}
