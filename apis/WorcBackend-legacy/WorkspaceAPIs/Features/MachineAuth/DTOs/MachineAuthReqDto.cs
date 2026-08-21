namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to register or validate a machine.
/// </summary>
public class MachineAuthReqDto
{
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
    /// Represents the host name of the machine (max length 255).
    /// </summary>
    [StringLength(255)]
    public required string Hostname { get; set; }

    /// <summary>
    /// Represents the username of the machine (max length 255).
    /// This should reflect the interactive/logged-on user, not the service account.
    /// </summary>
    [StringLength(255)]
    public required string Username { get; set; }

    /// <summary>
    /// Gets or sets the account under which the runner process is executing.
    /// For Windows services this is typically the service or machine account (e.g. THINKPAD$).
    /// It is used to build a stable machine name that does not change when a different
    /// user installs or owns the runner.
    /// </summary>
    [StringLength(255)]
    public string? ServiceAccountUsername { get; set; }

    /// <summary>
    /// Gets or sets the linked user account identifier for the machine.
    /// Accepts either a user GUID or the unique username of the linked account.
    /// </summary>
    [StringLength(254)]
    public required string LinkedUserAccountId { get; set; }
}
