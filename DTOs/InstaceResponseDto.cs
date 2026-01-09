namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents the response for on-prem instance validation.
/// </summary>
public class InstanceResponseDto
{
    /// <summary>
    /// Gets or sets a value indicating whether the instance is valid.
    /// </summary>
    public bool Valid { get; set; }

    /// <summary>
    /// Gets or sets the tenant information.
    /// </summary>
    public TenantDto? TenantInfo { get; set; }

    /// <summary>
    /// Gets or sets the contract details.
    /// </summary>
    public ContractDto? ContractInfo { get; set; }

    /// <summary>
    /// Gets or sets the enforcement settings for the instance.
    /// </summary>
    public EnforcementDto? EnforcementInfo { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the validation was done.
    /// </summary>
    public DateTimeOffset ValidationDate { get; set; }
}

/// <summary>
/// Represents tenant details.
/// </summary>
public class TenantDto
{
    /// <summary>
    /// Gets or sets the unique tenant ID.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the tenant.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the tenant (e.g., Enterprise).
    /// </summary>
    public required OnPremTenantTypesEnum Type { get; set; }
}

/// <summary>
/// Represents contract details for the tenant.
/// </summary>
public class ContractDto
{
    /// <summary>
    /// Gets or sets the contract start date.
    /// </summary>
    public DateTimeOffset StartDate { get; set; }

    /// <summary>
    /// Gets or sets the contract renewal date.
    /// </summary>
    public DateTimeOffset RenewalDate { get; set; }
}

/// <summary>
/// Represents enforcement settings for the instance.
/// </summary>
public class EnforcementDto
{
    /// <summary>
    /// Gets or sets a value indicating whether execution is disabled.
    /// </summary>
    public bool IsExecutionDisabled { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether login is disabled.
    /// </summary>
    public bool IsLoginDisabled { get; set; }

    /// <summary>
    /// Gets or sets the maximum allowed execution time (in milliseconds).
    /// </summary>
    public int MaxExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the number of invalid checks performed.
    /// </summary>
    public int InvalidCheckCount { get; set; }
}
