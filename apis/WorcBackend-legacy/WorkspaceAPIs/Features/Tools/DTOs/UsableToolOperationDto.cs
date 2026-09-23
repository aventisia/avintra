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

    /// <summary>
    /// Gets or sets the long-form description of the operation.
    /// </summary>
    [StringLength(4000)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the operation parameters (path, query, header).
    /// </summary>
    public List<UsableToolOperationParameterDto>? Parameters { get; set; }

    /// <summary>
    /// Gets or sets the request body metadata and property summary.
    /// </summary>
    public UsableToolOperationRequestBodyDto? RequestBody { get; set; }

    /// <summary>
    /// Gets or sets the preferred (2xx) response metadata and property summary.
    /// </summary>
    public UsableToolOperationResponseDto? Response { get; set; }

    /// <summary>
    /// Gets or sets the icon key resolved from the spec's x-agent-node extension.
    /// </summary>
    [StringLength(255)]
    public string? Icon { get; set; }

    /// <summary>
    /// Gets or sets the brand color resolved from the spec's x-agent-node extension.
    /// </summary>
    [StringLength(100)]
    public string? Color { get; set; }
}

/// <summary>
/// Represents a single parameter (path, query or header) of a tool operation.
/// </summary>
public class UsableToolOperationParameterDto
{
    /// <summary>
    /// Gets or sets the parameter name.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the parameter location (path, query, header).
    /// </summary>
    [StringLength(50)]
    public string? In { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the parameter is required.
    /// </summary>
    public bool Required { get; set; }

    /// <summary>
    /// Gets or sets the parameter description.
    /// </summary>
    [StringLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the primitive type of the parameter (string, integer, number, boolean).
    /// </summary>
    [StringLength(50)]
    public string? Type { get; set; }
}

/// <summary>
/// Represents the request body metadata of a tool operation.
/// </summary>
public class UsableToolOperationRequestBodyDto
{
    /// <summary>
    /// Gets or sets a value indicating whether the request body is required.
    /// </summary>
    public bool Required { get; set; }

    /// <summary>
    /// Gets or sets the content type (e.g. application/json).
    /// </summary>
    [StringLength(255)]
    public string? ContentType { get; set; }

    /// <summary>
    /// Gets or sets the flattened body property summaries.
    /// </summary>
    public List<UsableToolOperationPropertyDto>? Properties { get; set; }
}

/// <summary>
/// Represents the preferred (2xx) response metadata of a tool operation.
/// </summary>
public class UsableToolOperationResponseDto
{
    /// <summary>
    /// Gets or sets the response status code.
    /// </summary>
    public int? StatusCode { get; set; }

    /// <summary>
    /// Gets or sets the content type (e.g. application/json).
    /// </summary>
    [StringLength(255)]
    public string? ContentType { get; set; }

    /// <summary>
    /// Gets or sets the flattened response property summaries.
    /// </summary>
    public List<UsableToolOperationPropertyDto>? Properties { get; set; }
}

/// <summary>
/// Represents a single flattened property of a request body or response schema.
/// </summary>
public class UsableToolOperationPropertyDto
{
    /// <summary>
    /// Gets or sets the property name.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the primitive type of the property.
    /// </summary>
    [StringLength(50)]
    public string? Type { get; set; }

    /// <summary>
    /// Gets or sets the property description.
    /// </summary>
    [StringLength(1000)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the property is required.
    /// </summary>
    public bool Required { get; set; }
}
