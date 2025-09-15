namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a credit usage record, including information about the service type, usage amount, associated entity, and the user who consumed the credits.
/// </summary>
public class CreditsUsageDto
{
    /// <summary>
    /// Gets or sets the type of service for which the credits were used.
    /// </summary>
    public CreditServiceTypesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the number of unit consumed for the specified service. 
    /// </summary>
    public int ConsumedUnit { get; set; }

    /// <summary>
    /// Gets or sets the type of reference entity or operation where the credits were applied (e.g., Agent, AI Model).
    /// </summary>
    public UsageSourceTypesEnum? RefType { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the reference entity related to the credit usage (e.g., Agent ID, Model ID).
    /// </summary>
    public Guid? RefId { get; set; }

    /// <summary>
    /// Gets or sets the display name or description of the reference entity associated with the credit usage.
    /// </summary>
    public string? RefName { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the user who consumed the credits.
    /// </summary>
    public Guid? UsedByUserId { get; set; }
}


/// <summary>
/// Represents the overall credit usage summary for a given period, including aggregated data, usage breakdowns, and activity details.
/// </summary>
public class CreditsUsageSummaryDto
{
    /// <summary>
    /// Gets or sets the overall usage summary including total credits consumed and total transactions.
    /// </summary>
    public UsageSummaryDto UsageSummary { get; set; } = new UsageSummaryDto();

    /// <summary>
    /// Gets or sets the list of credit usage records over time.
    /// </summary>
    public List<DataUsageDataPointDto>? CreditUsages { get; set; }

    /// <summary>
    /// Gets or sets the list of transaction records over time.
    /// </summary>
    public List<DataUsageDataPointDto>? TransactionUsages { get; set; }

    /// <summary>
    /// Gets or sets the resource-wise usage breakdown, including cost and consumption history.
    /// </summary>
    public List<ResourceUsageDetailDto>? ResourceUsages { get; set; }

    /// <summary>
    /// Gets or sets the usage data grouped by individual users.
    /// </summary>
    public List<UserUsageDto>? Users { get; set; }

    /// <summary>
    /// Gets or sets the usage count for each AI model.
    /// </summary>
    public List<AiModelUsageDto>? AiModels { get; set; }

    /// <summary>
    /// Gets or sets the usage count for each agent.
    /// </summary>
    public List<AgentUsageDto>? Agents { get; set; }
}

/// <summary>
/// Contains total usage statistics including credits consumed and transactions performed.
/// </summary>
public class UsageSummaryDto
{
    /// <summary>
    /// Gets or sets the total number of credits consumed in the selected period.
    /// </summary>
    public int TotalCreditsConsumed { get; set; }

    /// <summary>
    /// Gets or sets the total number of transactions that occurred.
    /// </summary>
    public int TotalTransactionsCount { get; set; }
}

/// <summary>
/// Represents a record of total credit usage for a specific date.
/// </summary>
public class DataUsageDataPointDto
{
    /// <summary>
    /// Gets or sets the date for which the credit usage is recorded.
    /// </summary>
    public DateTimeOffset Date { get; set; }

    /// <summary>
    /// Gets or sets the total number of credits used on the specified date.
    /// </summary>
    public int Value { get; set; }
}

/// <summary>
/// Contains usage and credit cost details for a specific resource over time.
/// </summary>
public class ResourceUsageDetailDto
{
    /// <summary>
    /// Gets or sets the type of service this plan applies to, like OnPremGpuText.
    /// </summary>
    public CreditServiceTypesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the type of unit used to measure usage, like seconds, tokens, or messages.
    /// </summary>
    public UnitTypesEnum UnitType { get; set; }

    /// <summary>
    /// Gets or sets how much usage is in one unit, like 30 seconds or 1000 tokens.
    /// </summary>
    public int OneUnit { get; set; }

    /// <summary>
    /// Gets or sets how many credits are used for each unit.
    /// </summary>
    public int Credits { get; set; }

    /// <summary>
    /// Gets or sets the historical usage data points for this resource.
    /// </summary>
    public List<DataUsageDataPointDto>? UsageTimeline { get; set; }
}

/// <summary>
/// Represents an individual data point of resource usage.
/// </summary>
public class ResourceUsageDataPointDto
{
    /// <summary>
    /// Gets or sets the timestamp of this usage record.
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>
    /// Gets or sets the amount of the resource used at the given timestamp.
    /// </summary>
    public int UsageValue { get; set; }
}

/// <summary>
/// Represents usage statistics for a user, including personal identifiers and transaction count.
/// </summary>
public class UserUsageDto
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
    /// Gets or sets the total number of transactions performed by the user.
    /// </summary>
    public int TransactionsCount { get; set; }
}

/// <summary>
/// Represents usage metrics for a specific AI model.
/// </summary>
public class AiModelUsageDto
{
    /// <summary>
    /// Gets or sets the name of the AI model.
    /// </summary>
    public string? ModelName { get; set; }

    /// <summary>
    /// Gets or sets the number of times the model has been used.
    /// </summary>
    public int UsageCount { get; set; }
}

/// <summary>
/// Represents usage metrics for a specific agent.
/// </summary>
public class AgentUsageDto
{
    /// <summary>
    /// Gets or sets the name of the agent.
    /// </summary>
    public string? AgentName { get; set; }

    /// <summary>
    /// Gets or sets the number of times the agent has been used.
    /// </summary>
    public int UsageCount { get; set; }
}