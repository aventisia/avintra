namespace MLModelBuilderAPIs.Entities;

/// <summary>
/// Defines the configuration required for extracting structured data from a document.
/// This includes contextual information, an extraction prompt, and a reference to the associated machine learning model.
/// </summary>
public class ExtractionSetup : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Optional description of the document's context or type, providing additional information to guide the extraction process.
    /// </summary>
    public string? DocumentContext { get; set; }

    /// <summary>
    /// The prompt that guides the data extraction logic from the document.
    /// This is a required field with a maximum length of 1000 characters.
    /// </summary>
    [Required, MaxLength(1000)]
    public required string NodePrompt { get; set; }

    /// <summary>
    /// The unique identifier of the machine learning model associated with this extraction setup.
    /// </summary>
    public Guid MLModelId { get; set; }

    /// <summary>
    /// The machine learning model entity that this extraction setup is linked to.
    /// </summary>
    [ForeignKey("MLModelId")]
    public virtual MLModel? MLModel { get; set; }

    /// <summary>
    /// A collection of metadata for tables relevant to the document's structure.
    /// </summary>
    public virtual ICollection<TableMetadata>? TableMetadata { get; set; }

    /// <summary>
    /// A collection of field configurations defining specific data points to extract from the document.
    /// </summary>
    public virtual ICollection<FieldSetup>? FieldSetups { get; set; }
}