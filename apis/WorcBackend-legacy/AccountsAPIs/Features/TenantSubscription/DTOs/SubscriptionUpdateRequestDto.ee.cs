namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object (DTO) for updating a tenant's subscription details.
/// </summary>
public class SubscriptionUpdateRequestDto
{
    /// <summary>
    /// Gets or sets the subscription ID to identify the subscription to update.
    /// </summary>
    public Guid SubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the subscription plan.
    /// </summary>
    public Guid PlanId { get; set; }

    /// <summary>
    /// Gets or sets the frequency of the subscription plan (e.g., monthly or yearly).
    /// </summary>
    public SubscriptionFrequenciesEnum Frequency { get; set; }
}
