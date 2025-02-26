namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a machine creation.
/// </summary>
public class CreateMachineDto
{
    [RequiredGuid]
    public Guid TenantId { get; set; }

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
    /// get or set the Name of the machine max(200)
    /// </summary>
    [Required, MaxLength(100)]
    public string? Name { get; set; }

    /// <summary>
    ///  represents the operating system of the machine like Windows, Linux
    /// </summary>
    public MachineTypeEnum Type { get; set; }

    /// <summary>
    /// represents the environment of the machine Development, UAT, Production
    /// </summary>
    [Required, MaxLength(100)]
    public string? Environment { get; set; }

    /// <summary>
    /// represents the environment of the machine Development, UAT, Production
    /// </summary>
    public Guid? FlowGuid { get; set; }

    /// <summary>
    /// represent the flow/agent assignment at machine creation time.
    /// </summary>
    public bool IsScheduled { get; set; } = false;
}