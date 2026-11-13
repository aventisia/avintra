namespace WorkspaceAPIs.Entities;

/// <summary>
/// A named group the user files Home chats under.
/// </summary>
[Table("chat_projects")]
public class ChatProject : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who owns the project.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets the project name shown in the chat history. Max-100 characters.
    /// </summary>
    [MaxLength(100)]
    public required string Name { get; set; }
}
