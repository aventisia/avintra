namespace AccountsAPIs.DTOs;

/// <summary>
/// Data transfer object representing the details of a credit-based pricing plan,
/// including usage metrics, credit consumption, and audit information.
/// </summary>
public class CreditPlanDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the credit plan.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the credit plan.
    /// e.g. "On-prem GPU-text".
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the service type associated with this credit plan. e.g. CreditServiceTypesEnum.OnPremGpuText.
    /// </summary>
    public CreditServiceTypesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the unit type used to measure consumption for this plan. e.g. UnitTypesEnum.Seconds, Tokens, or Message.
    /// </summary>
    public required UnitTypesEnum UnitType { get; set; }

    /// <summary>
    /// Gets or sets the quantity represented by a single unit. e.g. 30 (seconds), 1000 (tokens), or 1 (message).
    /// </summary>
    public int OneUnit { get; set; }

    /// <summary>
    /// Gets or sets the number of credits consumed per unit. e.g. 15, 3, or 0 if usage is included in the plan.
    /// </summary>
    public int Credits { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the credit plan is currently disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the credit plan.
    /// For display or audit purposes only.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the credit plan was created.
    /// For display or audit purposes only.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the credit plan.
    /// For display or audit purposes only.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the timestamp indicating when the credit plan was last modified.
    /// For display or audit purposes only.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
