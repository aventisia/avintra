namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents the calculated BYOK consumption that was recorded for a specific service type.
/// </summary>
public class RecordedByokUsageDto
{
    /// <summary>
    /// Gets or sets the type of service for which the units were consumed.
    /// </summary>
    public CreditServicesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the number of provider units that were consumed for the service type.
    /// </summary>
    public double ConsumedUnit { get; set; }
}

/// <summary>
/// Defines the filter parameters used to export BYOK consumption data.
/// </summary>
public class ExportByokUsageRequestDto
{
    /// <summary>
    /// Gets or sets the list of credit service types to include in the export.
    /// </summary>
    public List<CreditServicesEnum> ServiceTypes { get; set; } = new();

    /// <summary>
    /// Gets or sets the list of user IDs to filter the BYOK consumption records.
    /// </summary>
    public List<Guid> UserIds { get; set; } = new();

    /// <summary>
    /// Gets or sets the list of agent IDs to filter the BYOK consumption records.
    /// </summary>
    public List<Guid> AgentIds { get; set; } = new();

    /// <summary>
    /// Gets or sets the start date used to filter BYOK consumption records by date.
    /// </summary>
    public DateTimeOffset? StartDate { get; set; }

    /// <summary>
    /// Gets or sets the end date used to filter BYOK consumption records by date.
    /// </summary>
    public DateTimeOffset? EndDate { get; set; }
}

/// <summary>
/// Represents a record of BYOK consumption, providing details such as the service type,
/// the amount of units consumed, the vault credential used, and the user involved.
/// </summary>
public class ExportByokUsageResponseDto
{
    /// <summary>
    /// Gets or sets the timestamp indicating when the units were consumed.
    /// </summary>
    public string? UsedOn { get; set; }

    /// <summary>
    /// Gets or sets the type of service for which the units were utilized.
    /// </summary>
    public CreditServicesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the unit of measurement for the usage, such as seconds, tokens, or characters.
    /// </summary>
    public UnitTypesEnum? UnitType { get; set; }

    /// <summary>
    /// Gets or sets the quantity of units consumed.
    /// </summary>
    public double ConsumedUnit { get; set; }

    /// <summary>
    /// Gets or sets the display name of the vault credential (BYOK key) that was used.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets the type of the reference entity or operation (e.g., Agent).
    /// </summary>
    public string? RefType { get; set; }

    /// <summary>
    /// Gets or sets the display name of the reference entity associated with the usage.
    /// </summary>
    public string? RefName { get; set; }

    /// <summary>
    /// Gets or sets the name or identifier of the agent that triggered the consumption.
    /// </summary>
    public string? TriggeredByAgent { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who consumed the units.
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// Gets or sets the type of the entity or operation the units were used for (e.g., AgentExecution).
    /// </summary>
    public string? Action { get; set; }
}
