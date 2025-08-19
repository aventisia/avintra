namespace AccountsAPIs.DTOs;

/// <summary>
/// Represents a record of credit usage, capturing details about the service type, amount used, and the user or reference entity involved.
/// </summary>
public class CreditsUsageDto
{
    /// <summary>
    /// Gets or sets the type of service where credits were consumed (e.g., OnPremGpuText).
    /// </summary>
    public required CreditServiceTypesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the number of credits consumed.
    /// </summary>
    public int Credits { get; set; }

    /// <summary>
    /// Gets or sets the reference ID associated with the usage context (e.g., AgentId, ModelId).
    /// </summary>
    public Guid? RefId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who consumed the credits.
    /// </summary>
    public Guid? UsageByUserId { get; set; }
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
    public List<CreditUsageDataPointDto>? CreditUsages { get; set; }

    /// <summary>
    /// Gets or sets the list of transaction records over time.
    /// </summary>
    public List<TransactionUsageDataPointDto>? TransactionUsages { get; set; }

    /// <summary>
    /// Gets or sets the resource-wise usage breakdown, including cost and consumption history.
    /// </summary>
    public List<ResourceUsageDetailDto>? ResourceUsages { get; set; }

    /// <summary>
    /// Gets or sets the usage data grouped by individual users.
    /// </summary>
    public List<UserUsageDto>? Usage { get; set; }

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
/// Represents a single data point of credit usage at a specific timestamp.
/// </summary>
public class CreditUsageDataPointDto
{
    /// <summary>
    /// Gets or sets the timestamp of the credit usage record.
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>
    /// Gets or sets the number of credits used at this timestamp.
    /// </summary>
    public int CreditsUsed { get; set; }
}

/// <summary>
/// Represents a single data point of transaction activity at a specific timestamp.
/// </summary>
public class TransactionUsageDataPointDto
{
    /// <summary>
    /// Gets or sets the timestamp of the transaction record.
    /// </summary>
    public DateTimeOffset Timestamp { get; set; }

    /// <summary>
    /// Gets or sets the number of transactions that occurred at this timestamp.
    /// </summary>
    public int TransactionsCount { get; set; }
}

/// <summary>
/// Contains usage and credit cost details for a specific resource over time.
/// </summary>
public class ResourceUsageDetailDto
{
    /// <summary>
    /// Gets or sets the display name of the resource (e.g., "GPU", "GPT-4").
    /// </summary>
    public string? ResourceName { get; set; }

    /// <summary>
    /// Gets or sets the credit cost per unit of resource usage.
    /// </summary>
    public decimal CreditCostPerUnit { get; set; }

    /// <summary>
    /// Gets or sets the unit of measurement for this resource (e.g., "Second", "Token").
    /// </summary>
    public string? MeasurementUnit { get; set; }

    /// <summary>
    /// Gets or sets the historical usage data points for this resource.
    /// </summary>
    public List<ResourceUsageDataPointDto>? UsageTimeline { get; set; }
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