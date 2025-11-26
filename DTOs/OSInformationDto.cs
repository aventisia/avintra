namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents information about the operating system, including its unique identifier and the associated host name.
/// </summary>
public class OSInformationDto
{
    /// <summary>
    /// Gets or sets the unique identifier for the operating system.
    /// </summary>
    public required string OSId { get; set; }

    /// <summary>
    /// Gets or sets the host name of the machine.
    /// </summary>
    public required string HostName { get; set; }

    /// <summary>
    /// Gets or sets the type of client interacting with the system, such as a web browser user, desktop application user, or an automated assistive machine.
    /// </summary>
    public ClientTypesEnum ClientType { get; set; } = ClientTypesEnum.DesktopAppUser;
}