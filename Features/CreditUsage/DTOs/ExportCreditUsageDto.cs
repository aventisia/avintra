namespace AccountsAPIs.DTOs;

/// <summary>
/// Defines the filter parameters used to export credit usage data.
/// </summary>
public class ExportCreditUsageRequestDto
{
    /// <summary>
    /// Gets or sets the list of credit service types to include in the export.
    /// </summary>
    public List<CreditServiceTypesEnum> ServiceTypes { get; set; } = new();

    /// <summary>
    /// Gets or sets the list of user IDs to filter the credit usage records.
    /// </summary>
    public List<Guid> UserIds { get; set; } = new();

    /// <summary>
    /// Gets or sets the list of AI model IDs to include in the exported data.
    /// </summary>
    public List<Guid> AIModelIds { get; set; } = new();

    /// <summary>
    /// Gets or sets the list of agent IDs to filter the credit usage records.
    /// </summary>
    public List<Guid> AgentIds { get; set; } = new();

    /// <summary>
    /// Gets or sets the start date used to filter credit usage records by date.
    /// </summary>
    public DateTimeOffset? StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date used to filter credit usage records by date.
    /// </summary>
    public DateTimeOffset? EndDate { get; set; }
}

/// <summary>
/// Represents a single record of exported credit usage, including details such as service type, amount used, reference entity, and user information.
/// </summary>
public class ExportCreditUsageResponseDto
{
    /// <summary>
    /// Gets or sets the type of service for which credits were used.
    /// </summary>
    public CreditServiceTypesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the total number of credits consumed.
    /// </summary>
    public double CreditsUsed { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the credits were used.
    /// </summary>
    public string? UsedOn { get; set; }

    /// <summary>
    /// Gets or sets the type of reference entity associated with the credit usage (e.g., Agent, AI Model).
    /// </summary>
    public UsageSourceTypesEnum? RefType { get; set; }

    /// <summary>
    /// Gets or sets the name or label of the reference entity associated with the usage.
    /// </summary>
    public string? RefName { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who consumed the credits.
    /// </summary>
    public string? Username { get; set; }
}
