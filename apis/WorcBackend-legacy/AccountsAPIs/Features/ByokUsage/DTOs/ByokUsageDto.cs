namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a BYOK consumption record, including the service type, the provider
/// units consumed, the vault credential used, and the user who consumed them.
/// </summary>
public class ByokUsageDto
{
    /// <summary>
    /// Gets or sets the type of service for which the units were consumed.
    /// </summary>
    public CreditServicesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the model provider name (e.g. "openai", "gemini", "elevenlabs").
    /// Used to group BYOK consumption charts by provider.
    /// </summary>
    public string? Provider { get; set; }

    /// <summary>
    /// Gets or sets the model name (e.g. "gpt-4o-mini").
    /// Used to title per-model consumption charts within a provider.
    /// </summary>
    public string? Model { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this BYOK usage belongs to.
    /// Null indicates the default "Central" space.
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets the number of provider units consumed for the specified service.
    /// </summary>
    public double ConsumedUnit { get; set; }

    /// <summary>
    /// Gets or sets the unit of measurement for the consumed amount (e.g. Tokens, Seconds, Characters).
    /// </summary>
    public UnitTypesEnum? UnitType { get; set; }

    /// <summary>
    /// Gets or sets the ID of the vault credential (BYOK key) that was used.
    /// </summary>
    public Guid? CredentialId { get; set; }

    /// <summary>
    /// Gets or sets the display name of the vault credential (BYOK key) that was used.
    /// </summary>
    public string? CredentialName { get; set; }

    /// <summary>
    /// Gets or sets the type of reference entity or operation where the units were applied (e.g., Agent).
    /// </summary>
    public UsageSourceTypesEnum? RefType { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the reference entity related to the usage (e.g., Agent ID, Model ID).
    /// </summary>
    public Guid? RefId { get; set; }

    /// <summary>
    /// Gets or sets the display name or description of the reference entity associated with the usage.
    /// </summary>
    public string? RefName { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who consumed the units.
    /// </summary>
    public Guid? UsedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the type of the entity or operation the units were used for (e.g., AgentExecution).
    /// </summary>
    public ActionTypesEnum? Action { get; set; }

    /// <summary>
    /// Gets or sets the name or identifier of the agent that triggered the consumption.
    /// </summary>
    public string? TriggeredByAgent { get; set; }
}

/// <summary>
/// Represents the overall BYOK consumption summary for a given period, grouped by
/// model provider. Each provider carries the per-model consumption breakdown so the
/// frontend can render one chart per model without mixing different unit types.
/// </summary>
public class ByokUsageSummaryDto
{
    /// <summary>
    /// Gets or sets the list of model providers, each with per-model consumption.
    /// </summary>
    public List<ByokProviderUsageDto> Providers { get; set; } = new();

    /// <summary>
    /// Gets or sets the usage data grouped by individual users.
    /// </summary>
    public List<ByokUserUsageDto>? Users { get; set; }

    /// <summary>
    /// Gets or sets the usage count for each agent.
    /// </summary>
    public List<ByokAgentUsageDto>? Agents { get; set; }
}

/// <summary>
/// Represents the BYOK consumption for a single model provider, including the
/// per-model breakdown.
/// </summary>
public class ByokProviderUsageDto
{
    /// <summary>
    /// Gets or sets the model provider name (e.g. "openai", "gemini", "elevenlabs").
    /// </summary>
    public string? Provider { get; set; }

    /// <summary>
    /// Gets or sets the per-model consumption for this provider.
    /// </summary>
    public List<ByokModelUsageDto> Models { get; set; } = new();
}

/// <summary>
/// Represents the BYOK consumption for a single model within a provider.
/// </summary>
public class ByokModelUsageDto
{
    /// <summary>
    /// Gets or sets the model name (e.g. "gpt-4o-mini").
    /// </summary>
    public string? Model { get; set; }

    /// <summary>
    /// Gets or sets the unit of measurement for the consumed amount (tokens, seconds, characters).
    /// </summary>
    public UnitTypesEnum? UnitType { get; set; }

    /// <summary>
    /// Gets or sets how many units were consumed by the model.
    /// </summary>
    public double TotalConsumption { get; set; }

    /// <summary>
    /// Gets or sets the historical usage data points for this model.
    /// </summary>
    public List<DataUsageDataPointDto>? UsageTimeline { get; set; }
}

/// <summary>
/// Represents usage statistics for a user, including personal identifiers and unit count.
/// </summary>
public class ByokUserUsageDto
{
    /// <summary>
    /// Gets or sets the user's first name.
    /// </summary>
    public string? FirstName { get; set; }

    /// <summary>
    /// Gets or sets the user's last name.
    /// </summary>
    public string? LastName { get; set; }

    /// <summary>
    /// Gets or sets the username or login ID of the user.
    /// </summary>
    public string? Username { get; set; }

    /// <summary>
    /// Gets or sets the total number of units used by the user.
    /// </summary>
    public double TotalConsumption { get; set; }
}

/// <summary>
/// Represents usage metrics for a specific agent.
/// </summary>
public class ByokAgentUsageDto
{
    /// <summary>
    /// Gets or sets the name of the agent.
    /// </summary>
    public string? AgentName { get; set; }

    /// <summary>
    /// Gets or sets the total number of units used by the agent.
    /// </summary>
    public double TotalConsumption { get; set; }
}
