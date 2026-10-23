namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents metadata information for an on-premise instance
/// </summary>
public class OnPremDeploymentMetaDataDto
{
    /// <summary>
    /// Gets or sets the type of the on-premise tenant (Commercial, Enterprise, etc.)
    /// </summary>
    public string TenantType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the type of the on-premise instance (Prod or NonProd)
    /// </summary>
    public string InstanceType { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the name of the on-premise tenant (e.g., "Contoso Ltd")
    /// </summary>
    public string TenantName { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the contract start date
    /// </summary>
    public DateTime ContractStart { get; set; }

    /// <summary>
    /// Gets or sets the contract end date
    /// </summary>
    public DateTime ContractEnd { get; set; }

    /// <summary>
    /// Gets or sets the allowed execution time in Hours for the tenant (including all instances)
    /// </summary>
    public int ExecutionTimeAllowed { get; set; }

    /// <summary>
    /// Gets or sets whether execution is disabled for the tenant
    /// </summary>
    public bool ExecutionDisabled { get; set; }

    /// <summary>
    /// Gets or sets whether login is disabled for the tenant
    /// </summary>
    public bool LoginDisabled { get; set; }

    /// <summary>
    /// Gets or sets whether single sign-on is allowed for the tenant.
    /// </summary>
    public bool SsoAllowed { get; set; } = false;

    /// <summary>
    /// Gets or sets whether deployment branding is allowed for the tenant.
    /// </summary>
    public bool BrandingAllowed { get; set; } = false;
}