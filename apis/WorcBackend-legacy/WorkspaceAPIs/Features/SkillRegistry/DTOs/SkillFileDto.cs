namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object for a skill file record.
/// </summary>
public class SkillFileDto
{
    /// <summary>
    /// Gets or sets the primary key of the skill file record.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the ID of the skill this file belongs to.
    /// </summary>
    [RequiredGuid]
    public Guid SkillId { get; set; }

    /// <summary>
    /// Gets or sets the name of the file. Max-255 characters.
    /// </summary>
    [StringLength(255)]
    public required string FileName { get; set; }

    /// <summary>
    /// Gets or sets the text content of the file.
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets the type of the file (e.g., markdown, python, shell, javascript).
    /// Max-50 characters.
    /// </summary>
    [StringLength(50)]
    public string? FileType { get; set; }

    /// <summary>
    /// Gets or sets the username of the user who created the skill file record.
    /// </summary>
    public string? CreatedBy { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the skill file record was created.
    /// </summary>
    public DateTimeOffset? CreatedOn { get; set; }
}

/// <summary>
/// Represents a payload to register a new file under a skill.
/// </summary>
public class RegisterSkillFileDto
{
    /// <summary>
    /// Gets or sets the name of the file. Max-255 characters.
    /// </summary>
    [StringLength(255)]
    public required string FileName { get; set; }

    /// <summary>
    /// Gets or sets the text content of the file.
    /// </summary>
    public required string Content { get; set; }

    /// <summary>
    /// Gets or sets the type of the file (e.g., markdown, python, shell, javascript).
    /// Max-50 characters.
    /// </summary>
    [StringLength(50)]
    public string? FileType { get; set; }
}

/// <summary>
/// Represents a skill with all its files for desktop sync.
/// </summary>
public class SkillSyncDto
{
    /// <summary>
    /// Gets or sets the name of the skill.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the skill.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the collection of files associated with the skill.
    /// </summary>
    public List<SkillFileDto> Files { get; set; } = new List<SkillFileDto>();
}
