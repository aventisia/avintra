namespace AccountsAPIs.DTOs;

public class TenantFilterQuery
{
    /// <summary>
    /// Gets or sets the start date for the tenant filter query (optional).
    /// </summary>
    public DateTimeOffset? StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date for the tenant filter query (optional).
    /// </summary>
    public DateTimeOffset? EndDate { get; set; }

    /// <summary>
    /// Gets or sets the plan type for filtering tenants.
    /// </summary>
    public SubscriptionPlanTypeEnum? PlanType { get; set; }
}