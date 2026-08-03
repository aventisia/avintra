namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the response returned after registering or validating a machine.
/// </summary>
public class MachineAuthResDto
{
    /// <summary>
    /// Gets or sets the JWT issued for the linked user account of the machine.
    /// </summary>
    public required string Jwt { get; set; }

    /// <summary>
    /// Gets or sets the expiry timestamp of the issued JWT.
    /// </summary>
    public required DateTimeOffset ExpiresOn { get; set; }

    /// <summary>
    /// Gets or sets the identifier of the registered machine.
    /// </summary>
    public required Guid MachineId { get; set; }
}
