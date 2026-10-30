namespace GlobalAdminAPIs.DTOs;

/// <summary>
/// Represents a Data Transfer Object (DTO) for an on-premises tenant, including details on the tenant's metadata,
/// platform configuration, contract information, execution settings, and audit information.
/// </summary>
public class OnPremInstanceDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the instance.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the instance (e.g., "prod-instance", "staging-instance", "IT-instance").
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the type of the instance, indicating whether it's a production or non-production instance.
    /// </summary>
    public OnPremInstanceTypesEnum Type { get; set; }

    /// <summary>
    /// Gets or sets the platform version of the instance.
    /// </summary>
    public string? PlatformVersion { get; set; }

    /// <summary>
    /// Gets or sets the deployment date of the instance.
    /// </summary>
    public DateTimeOffset? DeployedOn { get; set; }

    /// <summary>
    /// Gets or sets the date the instance was last validated.
    /// </summary>
    public DateTimeOffset? LastValidatedOn { get; set; }

    /// <summary>
    /// Gets or sets the number of invalid checks performed on the instance.
    /// This could represent failed validation or health check attempts.
    /// </summary>
    public int NoOfInvalidCheck { get; set; }

    /// <summary>
    /// Gets or sets the foreign key for the related OnPremTenant.
    /// </summary>
    public required Guid OnPremTenantId { get; set; }
}