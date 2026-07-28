namespace AccountsAPIs.DTOs;

/// <summary>
/// Defines the filter parameters used to export credit usage data.
/// </summary>
public class ExportCreditUsageRequestDto
{
    /// <summary>
    /// Gets or sets the list of credit service types to include in the export.
    /// </summary>
    public List<CreditServicesEnum> ServiceTypes { get; set; } = new();

    /// <summary>
    /// Gets or sets the list of user IDs to filter the credit usage records.
    /// </summary>
    public List<Guid> UserIds { get; set; } = new();

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
/// Represents a record of credit usage, providing details such as the service type, amount of credits consumed, the reference entity, and the user involved.
/// </summary>
public class ExportCreditUsageResponseDto
{
    /// <summary>
    /// Gets or sets the timestamp indicating when the credits were consumed.
    /// </summary>
    public string? UsedOn { get; set; }

    /// <summary>
    /// Gets or sets the type of service for which the credits were utilized.
    /// </summary>
    public CreditServicesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the unit of measurement for the usage, such as seconds, tokens, or messages.
    /// </summary>
    public UnitTypesEnum? UnitType { get; set; }

    /// <summary>
    /// Gets or sets the quantity of usage measured in one unit (e.g., 30 seconds or 1000 tokens).
    /// </summary>
    public double UnitUsed { get; set; }

    /// <summary>
    /// Gets or sets the total number of credits consumed for the usage.
    /// </summary>
    public double CreditsUsed { get; set; }

    /// <summary>
    /// Gets or sets the type of reference entity linked to the credit usage, such as Agent.
    /// </summary>
    public UsageSourceTypesEnum? RefType { get; set; }

    /// <summary>
    /// Gets or sets the name or label associated with the reference entity.
    /// </summary>
    public string? RefName { get; set; }

    /// <summary>
    /// Gets or sets the username of the individual who consumed the credits.
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// Gets or sets the type of the entity or operation the credits were used for (e.g., AgentExecution).
    /// </summary>
    public ActionTypesEnum? Action { get; set; }

    /// <summary>
    /// Gets or sets the name or identifier of the agent that triggered the consumption of credits. 
    /// </summary>
    public string? TriggeredByAgent { get; set; }
}
