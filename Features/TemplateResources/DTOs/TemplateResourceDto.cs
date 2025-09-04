namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a resource file linked to a specific project template version.
/// </summary>
public class TemplateResourceDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the resource.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the uploaded file. Maximum length is 255 characters.
    /// Gets or sets the name of the uploaded file. Maximum length is 255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the file extension of the uploaded resource (e.g., ".txt", ".json").
    /// </summary>
    public required string Extension { get; set; }

    /// <summary>
    /// Gets or sets the file size in bytes.
    /// </summary>
    public long Size { get; set; }

    /// <summary>
    /// Gets or sets the file storage path of the uploaded resource.
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the file is stored locally.
    /// </summary>
    public bool IsLocal { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this resource is used for setup or test purposes.
    /// </summary>
    public bool IsSetuptTest { get; set; }

    /// <summary>
    /// Gets or sets the textual content extracted or associated with the resource, if any.
    /// </summary>
    public string? ResourceText { get; set; }

    /// <summary>
    /// Gets or sets the name of the associated project template.
    /// </summary>
    public string? ProjectTemplateName { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier of the associated project template.
    /// </summary>
    public Guid ProjectTemplateId { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the block is disabled.
    /// </summary>
    /// <remarks>
    /// Note: This property is nullable to allow differentiation between true, false, and unspecified (null) states.
    /// </remarks>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the block.
    /// This property is intended for response use only and should not be included in requests.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the block was created.
    /// This property is intended for response use only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the block.
    /// This property is intended for response use only and should not be included in requests.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the block was last modified.
    /// This property is intended for response use only and should not be included in requests.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }
}
