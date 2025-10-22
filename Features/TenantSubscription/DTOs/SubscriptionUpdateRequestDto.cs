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
}
