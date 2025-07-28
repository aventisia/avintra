namespace MLModelBuilderAPIs.DTOs;

/// <summary>
/// Data Transfer Object (DTO) for representing a ml model template in its trending version.
/// </summary>
public class UseTemplateDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the ml model version.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the ml model. The maximum length is 255 characters.
    /// </summary>
    [MaxLength(255)]
    public string? Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the ml model. The maximum length is 500 characters.
    /// </summary>
    [MaxLength(500)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the category of the ml model (e.g., Inferencing, Conversation,, Generative etc.).
    /// </summary>
    public string? Type { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the referenced ml model.
    /// </summary>
    public Guid RefId { get; set; }

    /// <summary>
    /// Gets or sets a flag that indicates whether the ml model is disabled for the user.
    /// </summary>
    /// <remarks>
    /// This property is nullable to distinguish between true, false, and null values.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the person who created this ml model record.
    /// This field is for response use only and should not be included in request data.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this ml model record was created.
    /// This field is for response use only and should not be included in request data.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the person who created this ml model record.
    /// This field is for response use only and should not be included in request data.
    /// </summary>
    public string? CreatedByUsername { get; set; }

    /// <summary>
    /// Gets or sets the date and time when this ml model record was last modified.
    /// This field is for response use only and should not be included in request data.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
