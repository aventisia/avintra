namespace MLModelBuilderAPIs.Entities;

[Table("ModelAPIKeys")]
public class ModelAPIKeyReadOnly : BaseEntity
{
    /// <summary>
    /// Specifies the primary key of the tenant associated with this record, used for multi-tenancy filtering.
    /// </summary>
    public Guid TenantId { get; set; }

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