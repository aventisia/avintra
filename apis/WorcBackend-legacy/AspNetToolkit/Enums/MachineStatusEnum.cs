namespace AspNetToolkit.Enums;

/// <summary>
/// Enum representing the status of the machine.
/// </summary>
public enum MachineStatusEnum
{
    /// <summary>
    /// represents the free status of the machine
    /// </summary>
    Idle,

    /// <summary>
    /// represents the online status of the machine
    /// </summary>
    Online,

    /// <summary>
    /// represents the offline status of the machine
    /// </summary>
    Offline,

    /// <summary>
    /// represents the flow/agent running status of the machine
    /// </summary>
    Running,

    /// <summary>
    /// represents the flow/agent stopped status of the machine
    /// </summary>
    Stopped
}
