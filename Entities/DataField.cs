
using FieldTypesEnum = MLModelBuilderAPIs.Enum.FieldTypesEnum;

namespace MLModelBuilderAPIs.Entities;

public class DataField : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the field. Max 100 character
    /// </summary>
    [MaxLength(100)]
    public required string Name { get; set;}

    /// <summary>
    /// Gets or sets the type of field (e.g., Text, Date, Number).
    /// </summary>
    public FieldTypesEnum Type{ get; set; }

    /// <summary>
    /// Gets or sets the color of the field. Max 100 Character
    /// </summary>
    [MaxLength(100)]
    public required string Color{ get; set; }

    /// <summary>
    /// Gets or sets the description of the field
    /// </summary>
    [MaxLength(255)]
    public required string Description{ get; set; }

    /// <summary>
    /// Gets or sets the ML model record's primary key to which this record is associated.
    /// </summary>/
    public Guid MLModelId { get; set; }
    
    /// <summary>
    /// Gets or sets the model library to which this data model is associated with.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }

}