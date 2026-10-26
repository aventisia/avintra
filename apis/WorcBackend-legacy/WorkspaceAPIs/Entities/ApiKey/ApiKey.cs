namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents an API key associated with a tenant. Only the SHA256 hash of the key is persisted; the plain key is returned once on creation or regeneration.
/// </summary>
[Table("run_ApiKeys")]
public class ApiKey : IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the record's primary key in Guid (globally unique identifier) format.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the unique identifier for the tenant associated with this API key.
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the human-readable name of the API key. Max-255 characters.
    /// </summary>
    [Required]
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the SHA256 hash of the plain API key. Hex encoded, max-64 characters.
    /// </summary>
    [Required]
    [MaxLength(64)]
    public required string KeyHash { get; set; }

    /// <summary>
    /// Gets or sets the masked prefix of the API key shown in the UI (e.g., "av-3q1..."). Max-10 characters.
    /// </summary>
    [MaxLength(10)]
    public string? KeyPrefix { get; set; }

    /// <summary>
    /// Gets or sets the optional expiration date and time of the API key.
    /// </summary>
    public DateTimeOffset? ExpiresAt { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the API key was last used for authentication.
    /// </summary>
    public DateTimeOffset? LastUsedAt { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the API key is revoked.
    /// </summary>
    public bool IsRevoked { get; set; } = false;

    /// <summary>
    /// Gets or sets the optional permissions associated with the API key (JSONB).
    /// </summary>
    public ApiKeyPermissions? Permissions { get; set; }

    /// <summary>
    /// Gets or sets the ID of the user who created the record.
    /// </summary>
    public Guid CreatedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the WorkspaceUser who created the record.
    /// </summary>
    [ForeignKey("CreatedByUserId")]
    public virtual WorkspaceUser? CreatedByUser { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was created.
    /// </summary>
    public DateTimeOffset CreatedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the ID of the user who modified the record last.
    /// </summary>
    public Guid LastModifiedByUserId { get; set; }

    /// <summary>
    /// Gets or sets the WorkspaceUser who modified the record last.
    /// </summary>
    [ForeignKey("LastModifiedByUserId")]
    public virtual WorkspaceUser? LastModifiedByUser { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the record was last modified.
    /// </summary>
    public DateTimeOffset LastModifiedOn { get; set; } = DateTimeOffset.UtcNow;

    /// <summary>
    /// Gets or sets the version number used for row versioning.
    /// </summary>
    [Timestamp]
    public uint Version { get; set; }
}
