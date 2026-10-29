namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the data transfer object (DTO) used for upgrading a subscription 
/// to a new plan in a self-hosted service environment.
/// </summary>
public class SelfHostedSubscriptionUpgradeDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the subscription being upgraded for the self-hosted service.
    /// </summary>
    public Guid SubscriptionId { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the plan to which the subscription is being upgraded.
    /// </summary>
    public Guid PlanId { get; set; }
}