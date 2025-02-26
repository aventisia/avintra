namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a machine update.
/// </summary>
public class UpdateMachineDto
{
    [RequiredGuid]
    public Guid TenantId { get; set; }

    [RequiredGuid]
    public Guid MachineId { get; set; }

    /// <summary>
    /// get or set the Name of the machine max(200)
    /// </summary>
    [Required, MaxLength(200)]
    public string? Name { get; set; }

    /// <summary>
    /// IP address of the machine IPv4 or 6
    /// </summary>
    [Required, MaxLength(100)]
    public string? IPAddress { get; set; }

    /// <summary>
    /// represents the host name of the machine
    /// </summary>
    [MaxLength(100)]
    public string? Hostname { get; set; }

    /// <summary>
    /// represents the environment of the machine Development, UAT, Production
    /// </summary>
    [Required, MaxLength(100)]
    public string? Environment { get; set; }

    /// <summary>
    /// represents the environment of the machine state.
    /// </summary>
    public bool IsDisabled { get; set; } = false;
}