
namespace AccountsAPIs.Entities;

public class CustomRole : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of a role
    /// </summary>
    public string FullName { get; set;}

    /// <summary>
    /// Gets or sets the short name of a role
    /// </summary>
    public string? ShortName { get; set;}

    /// <summary>
    /// Gets or sets the description for the role
    /// </summary>
    public string? Description { get; set;}


}