namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a file associated with a skill, such as SKILL.md or supporting scripts.
/// File content is stored directly in the database as text for easy retrieval and sync.
/// </summary>
[Table("worc_SkillFiles")]
public class SkillFile : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the skill this file belongs to.
    /// </summary>
    public Guid SkillId { get; set; }

    /// <summary>
    /// Gets or sets the name of the file. Max-255 characters.
    /// </summary>
    [MaxLength(255)]
    public required string FileName { get; set; }

    /// <summary>
    /// Gets or sets the text content of the file.
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets the type of the file (e.g., markdown, python, shell, javascript).
    /// </summary>
    [MaxLength(50)]
    public string? FileType { get; set; }

    /// <summary>
    /// Navigation property to the parent skill.
    /// </summary>
    [ForeignKey("SkillId")]
    public virtual Skill? Skill { get; set; }
}
