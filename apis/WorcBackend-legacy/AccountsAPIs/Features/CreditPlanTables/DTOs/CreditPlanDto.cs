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
    /// Gets or sets the type of service this plan applies to.
    /// </summary>
    public required CreditServicesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the type of unit used to measure usage, like seconds, tokens, or messages.
    /// </summary>
    public required UnitTypesEnum UnitType { get; set; }

    /// <summary>
    /// Gets or sets how much usage is in one unit, like 30 seconds or 1000 tokens.
    /// </summary>
    public double OneUnit { get; set; }

    /// <summary>
    /// Gets or sets how many credits are used for each unit.
    /// </summary>
    public double Credits { get; set; }

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
