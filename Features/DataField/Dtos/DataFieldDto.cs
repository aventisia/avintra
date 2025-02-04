using FieldTypesEnum = MLModelBuilderAPIs.Enum.FieldTypesEnum;

namespace MLModelBuilderAPIs.Dtos;

/// <summary>
/// Represents a dto model for Data field entity
/// </summary>
public class DataFieldDto
{
    /// <summary>
    /// Gets or sets the ML model record's primary key to which this record is associated.
    /// </summary>/
    public Guid MLModelId { get; set; }

    /// <summary>
    /// Gets or sets the primary key for the field.
    /// </summary>
    public Guid Id { get; set; }

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
    /// Gets or sets the date of creation of data field.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who modified the record last.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the the user who created the record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the the username who created the record.
    /// </summary>
    public string? CreatedByUsername { get; set; }
}