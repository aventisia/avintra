namespace WorkspaceAPIs.Entities;

/// <summary>
/// Holds a user's custom instructions and memory notes that apply to every Home chat.
/// </summary>
[Table("chat_user_profiles")]
public class UserChatProfile : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user this profile belongs to.
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Gets or sets how the assistant should respond for this user. Max-1500 characters.
    /// </summary>
    [MaxLength(1500)]
    public string CustomInstructions { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the facts the user wants the assistant to remember across chats. Max-4000 characters.
    /// </summary>
    [MaxLength(4000)]
    public string MemoryNotes { get; set; } = string.Empty;
}
