namespace MLModelBuilderAPIs.Entities;

public class ModelTask : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant identifier for multi-tenancy filtering.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the model task (required, max length 255).
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the optional setup information for the task.
    /// </summary>
    public string? SetupObject { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the associated machine learning model.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the navigation property for the associated machine learning model.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }
}