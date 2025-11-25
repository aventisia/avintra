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
}