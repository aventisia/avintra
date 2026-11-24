namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Renames a chat artifact together with all of its versions.
/// </summary>
public class UpdateChatArtifactDto
{
    /// <summary>
    /// Gets or sets the ID of any version of the artifact.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the new file name, keeping the current extension (max 255 characters).
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }
}
