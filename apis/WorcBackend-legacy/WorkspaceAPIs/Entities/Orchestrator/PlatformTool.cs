using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace WorkspaceAPIs.Entities;

/// <summary>
/// Represents a built-in platform tool shared by every tenant.
/// </summary>
[Table("ai_PlatformTools")]
public class PlatformTool
{
    /// <summary>
    /// Gets or sets the record identifier.
    /// </summary>
    [Key]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the name of the tool.
    /// </summary>
    [MaxLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the description of the tool.
    /// </summary>
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the OpenAPI specification.
    /// </summary>
    public string? OpenApiSpec { get; set; }

    /// <summary>
    /// Gets or sets the parsed OpenAPI schema.
    /// </summary>
    [Column(TypeName = "jsonb")]
    public JsonDocument? ParsedSchema { get; set; }

    /// <summary>
    /// Gets or sets whether the tool is popular.
    /// </summary>
    public bool IsPopular { get; set; }

    /// <summary>
    /// Gets or sets whether the tool is disabled.
    /// </summary>
    public bool IsDisabled { get; set; } = false;

    /// <summary>
    /// Gets or sets the concurrency version.
    /// </summary>
    [Timestamp]
    public uint Version { get; set; }
}
