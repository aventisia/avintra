namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to add a machine.
/// </summary>
public class AddMachineDto
{
    /// <summary>
    /// Represents the environment of the machine, e.g., Development, UAT, Production.
    /// </summary>
    public required EnvironmentTypesEnum Environment { get; set; }

    /// <summary>
    /// Represents the operating system of the machine, e.g., Windows or Linux.
    /// </summary>
    public required OsTypesEnum OperatingSystem { get; set; }

    /// <summary>
    /// Gets or sets the identifier that uniquely represents the operating system (max length 100).
    /// </summary>
    [StringLength(100)]
    public required string OsID { get; set; }

    /// <summary>
    /// Represents the username of the machine (max length 255).
    /// </summary>
    [StringLength(255)]
    public required string Username { get; set; }

    /// <summary>
    /// Represents the host name of the machine (max length 255).
    /// </summary>
    [StringLength(255)]
    public required string Hostname { get; set; }

    /// <summary>
    /// Optional IP address of the machine (supports IPv4 or IPv6, max length 100).
    /// </summary>
    [StringLength(100)]
    public string? IpAddress { get; set; }
}
