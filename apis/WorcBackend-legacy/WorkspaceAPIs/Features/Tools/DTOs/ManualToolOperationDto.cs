namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a manually authored tool operation. Manual operations are
/// synthesized into a standard OpenAPI specification before persistence so the
/// existing flatten/test/execute pipeline can process them unchanged.
/// </summary>
public class ManualToolOperationDto
{
    /// <summary>
    /// Gets or sets the display name of the operation.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the long-form description of the operation.
    /// </summary>
    [StringLength(4000)]
    public string? Description { get; set; }

    /// <summary>
    /// Gets or sets the HTTP method (GET, POST, PUT, PATCH, DELETE).
    /// </summary>
    [StringLength(10)]
    public required string Method { get; set; }

    /// <summary>
    /// Gets or sets the endpoint path template (e.g. <c>/users/{id}</c>).
    /// </summary>
    [StringLength(500)]
    public required string Endpoint { get; set; }

    /// <summary>
    /// Gets or sets the static headers applied to every request of this operation.
    /// </summary>
    public List<ManualToolOperationHeaderDto>? Headers { get; set; }

    /// <summary>
    /// Gets or sets the user-defined parameters (query, header) of the operation.
    /// </summary>
    public List<ManualToolOperationParameterDto>? Parameters { get; set; }

    /// <summary>
    /// Gets or sets the JSON payload sample used to infer the request body schema.
    /// </summary>
    public string? JsonPayload { get; set; }
}

/// <summary>
/// Represents a static header of a manually authored operation.
/// </summary>
public class ManualToolOperationHeaderDto
{
    /// <summary>
    /// Gets or sets the header name.
    /// </summary>
    [StringLength(255)]
    public required string Key { get; set; }

    /// <summary>
    /// Gets or sets the header value.
    /// </summary>
    [StringLength(2000)]
    public string? Value { get; set; }
}

/// <summary>
/// Represents a user-defined parameter of a manually authored operation.
/// </summary>
public class ManualToolOperationParameterDto
{
    /// <summary>
    /// Gets or sets the parameter name.
    /// </summary>
    [StringLength(255)]
    public required string Name { get; set; }

    /// <summary>
    /// Gets or sets the parameter location (query, header).
    /// </summary>
    [StringLength(50)]
    public required string In { get; set; }

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