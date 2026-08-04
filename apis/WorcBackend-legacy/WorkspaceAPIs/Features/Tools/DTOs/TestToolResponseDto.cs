namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the result of a tool test execution.
/// </summary>
public class TestToolResponseDto
{
    /// <summary>
    /// Gets or sets a value indicating whether the tool operation completed successfully.
    /// </summary>
    public bool Success { get; set; }

    /// <summary>
    /// Gets or sets the HTTP status code returned by the tool operation, if applicable.
    /// </summary>
    [JsonPropertyName("status_code")]
    public int? StatusCode { get; set; }

    /// <summary>
    /// Gets or sets the response body returned by the tool operation.
    /// </summary>
    public string? Body { get; set; }

    /// <summary>
    /// Gets or sets the execution duration of the tool operation, in milliseconds.
    /// </summary>
    [JsonPropertyName("duration_ms")]
    public double? DurationMs { get; set; }
}