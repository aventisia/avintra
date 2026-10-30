namespace GlobalAdminAPIs.Services;

/// <summary>
/// Represents a service for managing the current on-prem tenant and instance information for the current request.
/// </summary>
public interface ICurrentOnPremTenantService
{
    /// <summary>
    /// Gets or sets the ID of the current on-prem tenant for the current request.
    /// </summary>
    Guid CurrentOnPremTenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the current instance for the current request.
    /// This property is required for applying global filters in the DbContext for multi-instance scenarios.
    /// </summary>
    Guid CurrentOnPremInstanceId { get; set; }
}