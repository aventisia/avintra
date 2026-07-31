namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a skill registry entry that contains metadata and associated files
/// such as SKILL.md and execution scripts. Skills can be global (platform-provided)
/// or tenant/user-created, and may be shared across users within a tenant.
/// </summary>
[Table("worc_Skills")]
public class Skill : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the name of the skill. Max-255 characters. Unique within the tenant.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the skill.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets whether the component is platform-managed or custom.
    /// </summary>
    public required ComponentTypeEnum Type { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether this skill is globally provided by the platform.
    /// </summary>
    public bool IsGlobal { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the skill is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the skill is active and available for use.
    /// </summary>
    public bool IsActive { get; set; } = true;

    /// <summary>
    /// Navigation property for the files associated with this skill.
    /// </summary>
    public virtual ICollection<SkillFile> Files { get; set; } = new List<SkillFile>();
}
