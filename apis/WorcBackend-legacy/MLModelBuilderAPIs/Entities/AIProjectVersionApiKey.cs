namespace MLModelBuilderAPIs.Entities;

[Table("as_AIProjectVersionApiKeys")]
public class AIProjectVersionApiKey : BaseEntity, IMustHaveTenant
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
  /// The API key used to access the associated AI projct.
  /// </summary>
  [MaxLength(256)]
  public string ApiKey { get; set; } = string.Empty;

  /// <summary>
  /// Gets or sets the unique identifier of the project version this api key belongs to.
  /// </summary>
  public required Guid AIProjectVersionId { get; set; }

  /// <summary>
  /// Gets or sets the AI project version to which this resource is associated.
  /// </summary>
  [ForeignKey("AIProjectVersionId")]
  public virtual AIProjectVersion? AIProjectVersion { get; set; }

}