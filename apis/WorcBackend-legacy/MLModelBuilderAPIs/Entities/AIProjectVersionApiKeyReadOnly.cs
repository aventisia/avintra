namespace MLModelBuilderAPIs.Entities;

[Table("as_AIProjectVersionApiKeys")]
public class AIProjectVersionApiKeyReadOnly : BaseEntity
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
    /// Gets or sets the unique identifier of the project version this api key belongs to.
    /// </summary>
    public Guid AIProjectVersionId { get; set; }

    /// <summary>
    /// Gets or sets the AI project version to which this resource is associated.
    /// </summary>
    [ForeignKey("AIProjectVersionId")]
    public virtual AIProjectVersion? AIProjectVersion { get; set; }

}