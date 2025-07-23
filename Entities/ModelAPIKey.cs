namespace MLModelBuilderAPIs.Entities;

public class ModelAPIKey : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Specifies the primary key of the tenant associated with this record, used for multi-tenancy filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of api key. Max character is 50.
    /// </summary>
    [MaxLength(50)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of api key 
    /// </summary>
    public string? Description { get; set; }
    
    /// <summary>
    /// The API key used to access the associated ML model.
    /// </summary>
    [MaxLength(256)]
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// References the primary key of the associated ML model.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Navigation property linking to the associated ML model entity.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }
}