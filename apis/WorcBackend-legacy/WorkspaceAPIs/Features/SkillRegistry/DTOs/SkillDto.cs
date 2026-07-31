namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a skill record.
/// </summary>
public class SkillDto
{
    /// <summary>
    /// Gets or sets the primary key of the skill record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the skill. Max-255 characters.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the skill.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets whether the component is platform-managed or custom.
    /// </summary>
    public ComponentTypeEnum? Type { get; set; }

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
    public bool IsActive { get; set; }

    /// <summary>
    /// Gets or sets the permission level granted to the user.
    /// </summary>
    public ResourceAccessTypeEnum AccessLevel { get; set; }

    /// <summary>
    /// Gets or sets a flag indicating whether the skill record is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the skill record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the skill record was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who last modified the skill record.
    /// </summary>
    public string? LastModifiedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the skill record was last modified.
    /// </summary>
    public DateTimeOffset? LastModifiedOn { get; set; }

    /// <summary>
    /// Gets or sets the number of files associated with this skill.
    /// </summary>
    public int FileCount { get; set; }
}

