namespace AspNetToolkit.Entities;

/// <summary>
/// Represents an interface to implement on entity that must have a tenant.
/// </summary>
/// <remarks>
/// Note: Do not miss to add this to any entity which should be a part of part of multi tenancy architecture.
/// </remarks>
public interface IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the primary key of the tenant record.
    /// </summary>
    public Guid TenantId { get; set; }
}