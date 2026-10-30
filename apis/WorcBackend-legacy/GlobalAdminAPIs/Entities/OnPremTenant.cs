namespace GlobalAdminAPIs.Entities;

/// <summary>
/// Represents an on-premises tenant, containing all relevant details about the tenant's contract, platform configuration,
/// execution settings, and audit information. This entity is typically used to store and manage tenant-related data 
/// for platform operations and monitoring.
/// </summary>
[Table("ga_OnPremTenants")]
public class OnPremTenant
{
    /// <summary>
    /// Gets or sets the unique identifier for the on-prem tenant (Primary Key).
    /// </summary>
    [Key]
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
    public int ExecutionTimeAllowed { get; set; }

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
    /// </summary>
    public bool IsSsoAllowed { get; set; } = false;

    /// <summary>
    /// Gets or sets a flag that indicates whether deployment branding is allowed for this tenant.
    /// </summary>
    public bool IsBrandingAllowed { get; set; } = false;

    /// <summary>
    /// Gets or sets the email address used by the organization for communication.
    /// </summary>
    public string? OurEmails { get; set; }

    /// <summary>
    /// Gets or sets the email address provided by the tenant for support and communication.
    /// </summary>
    public required string TenantEmails { get; set; }

    /// <summary>
    /// Gets or sets the user who created this tenant record.
    /// </summary>
    public required string CreatedByUser { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the tenant record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the user who last modified this tenant record.
    /// </summary>
    public required string LastModifiedByUser { get; set; }

    /// <summary>
    /// Gets or sets the timestamp when the tenant record was last modified.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets the remaining execution time available for the tenant. 
    /// This is calculated as the difference between the maximum allowed execution time and the total execution time that has already been used.
    /// </summary>
    public double AvailableExecutionTime { get; set; }

    /// <summary>
    /// Gets or sets the list of on-premises instances associated with this tenant.
    /// This navigation property allows tracking of all instances belonging to the tenant.
    /// </summary>
    public virtual ICollection<OnPremInstance> OnPremInstances { get; set; } = new List<OnPremInstance>();
}
