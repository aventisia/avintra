namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the operations a usable tool exposes, together with the credential
/// type required to invoke them.
/// </summary>
public class UsableToolOperationsDto
{
    /// <summary>
    /// Gets or sets the credential (vault) type to filter credentials by, or
    /// <c>null</c> when it cannot be resolved.
    /// </summary>
    public string? CredentialType { get; set; }

    /// <summary>
    /// Gets or sets the operations exposed by the tool's OpenAPI specification.
    /// </summary>
    public IEnumerable<UsableToolOperationDto> Operations { get; set; } = [];
}
