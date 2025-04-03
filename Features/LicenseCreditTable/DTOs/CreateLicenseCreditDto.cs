namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a data transfer object that contains details about a tenant's licensing credits, 
/// including allocation, consumption, billing information, and tenant metadata.
/// This object is used to request or approve license credits for tenants.
/// </summary>
public class RequestLicenseCreditDto
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
}
