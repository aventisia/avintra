namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents the response for on-prem instance validation.
/// </summary>
public class InstanceResponseDto
{
    /// <summary>
    /// Gets or sets a value indicating whether the instance is valid.
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// Gets or sets the tenant information.
    /// </summary>
    public InstanceTenantDto? Tenant { get; set; }

    /// <summary>
    /// Gets or sets the contract details.
    /// </summary>
    public InstanceContractDto? Contract { get; set; }

    /// <summary>
    /// Gets or sets the enforcement settings for the instance.
    /// </summary>
    public InstanceEnforcementDto? Enforcement { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the validation was done.
    /// </summary>
    public DateTimeOffset ValidatedOn { get; set; }
}

/// <summary>
/// Represents tenant details.
/// </summary>
public class InstanceTenantDto
{
    /// <summary>
    /// Gets or sets the unique tenant ID.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the tenant.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the tenant (e.g., Enterprise).
    /// </summary>
    public OnPremTenantTypesEnum Type { get; set; }
}

/// <summary>
/// Represents contract details for the tenant.
/// </summary>
public class InstanceContractDto
{
    /// <summary>
    /// Gets or sets the contract start date.
    /// </summary>
    public DateTimeOffset ContractStartDate { get; set; }

    /// <summary>
    /// Gets or sets the contract renewal date.
    /// </summary>
    public DateTimeOffset ContractRenewalDate { get; set; }
}

/// <summary>
/// Represents enforcement settings for the instance.
/// </summary>
public class InstanceEnforcementDto
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
    /// Gets or sets whether single sign-on is allowed.
    /// </summary>
    public bool IsSsoAllowed { get; set; } = false;

    /// <summary>
    /// Gets or sets whether deployment branding is allowed.
    /// </summary>
    public bool IsBrandingAllowed { get; set; } = false;

    /// <summary>
    /// Gets or sets the maximum allowed execution time (in milliseconds).
    /// </summary>
    public double ExecutionTimeAllowed { get; set; }

    /// <summary>
    /// Gets or sets the number of invalid checks performed.
    /// </summary>
    public int NoOfInvalidCheck { get; set; }
}