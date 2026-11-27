namespace WorkspaceAPIs.Entities;

/// <summary>
/// A text file attached to a chat project and added to the prompt of every chat in it.
/// </summary>
[Table("chat_project_files")]
public class ChatProjectFile : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who owns the file.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the project the file belongs to.
    /// </summary>
    public Guid ProjectId { get; set; }

    /// <summary>
    /// Gets or sets the project the file belongs to.
    /// </summary>
    [ForeignKey("ProjectId")]
    public ChatProject? Project { get; set; }

    /// <summary>
    /// Gets or sets the file name. Max-200 characters.
    /// </summary>
    [MaxLength(200)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the file text.
    /// </summary>
    [Column(TypeName = "text")]
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets the UTF-8 size of the content in bytes.
    /// </summary>
    public int SizeBytes { get; set; }
}
