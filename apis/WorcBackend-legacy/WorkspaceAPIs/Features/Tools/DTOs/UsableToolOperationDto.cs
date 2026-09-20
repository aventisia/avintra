namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a single invocable operation exposed by a tool's OpenAPI specification.
/// </summary>
public class UsableToolOperationDto
{
    /// <summary>
    /// Gets or sets the OpenAPI operation identifier.
    /// </summary>
    [StringLength(255)]
    public required string OperationId { get; set; }

    /// <summary>
    /// Gets or sets the HTTP method of the operation.
    /// </summary>
    [StringLength(20)]
    public string? Method { get; set; }

    /// <summary>
    /// Gets or sets the request path of the operation.
    /// </summary>
    [StringLength(500)]
    public string? Path { get; set; }

    /// <summary>
    /// Gets or sets the human-readable summary of the operation.
    /// </summary>
    [StringLength(1000)]
    public string? Summary { get; set; }
}
