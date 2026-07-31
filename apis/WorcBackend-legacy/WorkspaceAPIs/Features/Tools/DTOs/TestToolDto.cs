namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a request to test a tool operation.
/// </summary>
public class TestToolDto
{
    /// <summary>
    /// Gets or sets the identifier of the operation to execute.
    /// </summary>
    public required string OperationId { get; set; }

    /// <summary>
    /// Gets or sets the input parameters for the operation.
    /// The key represents the parameter name, and the value represents the parameter value.
    /// </summary>
    public Dictionary<string, object>? Parameters { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the credential used to authenticate the tool request.
    /// </summary>
    public Guid? CredentialId { get; set; }
}