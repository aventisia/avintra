namespace GlobalAdminAPIs.DTOs;

/// <summary>
/// Represents a Data Transfer Object (DTO) for an on-premises tenant, including details on the tenant's metadata,
/// platform configuration, contract information, execution settings, and audit information.
/// </summary>
public class OnPremTenantDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the on-prem tenant (Primary Key).
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the tenant or organization.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of tenant. It can either be an Enterprise or Commercial tenant.
    /// </summary>
    public OnPremTenantTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the allowed execution time in multiples of 100. This is used to define how long the tenant is allowed 
    /// to execute specific platform processes.
    /// </summary>
    public double ExecutionTimeAllowed { get; set; }

    /// <summary>
    /// Gets or sets the total execution time consumed by the tenant.
    /// </summary>
    public double ConsumedExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the contract start date for the tenant.
    /// </summary>
    public DateTimeOffset ContractStartDate { get; set; }

    /// <summary>
    /// Gets or sets the contract renewal date for the tenant.
    /// </summary>
    public DateTimeOffset ContractRenewalDate { get; set; }

    /// <summary>
    /// Gets or sets a flag that indicates whether execution is disabled for this tenant. 
    /// If true, certain execution-related operations will not be allowed.
    /// </summary>
    public bool IsExecutionDisabled { get; set; }

    /// <summary>
    /// Gets or sets a flag that indicates whether login is disabled for this tenant. 
    /// If true, users of this tenant will be prevented from logging in.
    /// </summary>
    public bool IsLoginDisabled { get; set; }

    /// <summary>
    /// Gets or sets a flag that indicates whether single sign-on is allowed for this tenant.
    /// Nullable so callers can omit the field: when omitted on create it is treated as false,
    /// and when omitted on update the existing value is preserved instead of being reset.
    /// </summary>
    public bool? IsSsoAllowed { get; set; }

    /// <summary>
    /// Gets or sets a flag that indicates whether deployment branding is allowed for this tenant.
    /// Nullable so callers can omit the field: when omitted on create it is treated as false,
    /// and when omitted on update the existing value is preserved instead of being reset.
    /// </summary>
    public bool? IsBrandingAllowed { get; set; }

    /// <summary>
    /// Gets or sets the email address used by the organization for communication.
    /// </summary>
    public string? OurEmails { get; set; }

    /// <summary>
    /// Gets or sets the email address provided by the tenant for support and communication.
    /// </summary>
    public string? TenantEmails { get; set; }

    /// <summary>
    /// Gets or sets a flag that indicates whether any instance of the tenant has failed. If true, it means one or more instances have failed; otherwise, it's false.
    /// </summary>
    public bool IsAnyInstanceFailed { get; set; }

    /// <summary>
    /// Gets or sets the user who created this tenant record.
    /// </summary>
    public string? CreatedByUser { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the tenant record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the user who last modified this tenant record.
    /// </summary>
    public string? LastModifiedByUser { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the tenant record was last modified.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; }
}