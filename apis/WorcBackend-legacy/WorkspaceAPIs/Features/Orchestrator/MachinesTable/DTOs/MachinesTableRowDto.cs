namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents machine data returned by machine APIs.
/// </summary>
/// <remarks>
/// Same DTO will be used for table row and exporting machine data to CSV. 
/// Display attributes are used to define the column names for the exported CSV file.
/// </remarks>
public class MachinesTableRowDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the machine.
    /// </summary>
    [Display(Name = "Machine ID")]
    public Guid Id { get; set; }

    /// <summary>
    /// Gets or sets the generated unique machine name.
    /// </summary>
    public required string Name { get; set; }

    /// <summary>
    /// Represents the operating system of the machine, e.g., Windows, Linux.
    /// </summary>
    [Display(Name = "Operating System")]
    public required OsTypesEnum OperatingSystem { get; set; }

    /// <summary>
    /// Gets or sets the identifier that uniquely represents the operating system (max length 100).
    /// </summary>
    [StringLength(100)]
    [Display(Name = "OS Unique ID")]
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
    /// Represents the timestamp of when the machine was last checked in.
    /// </summary>
    [Display(Name = "Last Checked In")]
    public DateTime LastCheckedIn { get; set; }

    /// <summary>
    /// Represents the status of the machine.
    /// </summary>
    public MachineStatusEnum Status { get; set; } = MachineStatusEnum.Offline;

    /// <summary>
    /// Gets or sets the number of flow versions associated with the machine.
    /// </summary>
    [Display(Name = "Agents")]
    public int FlowVersionCount { get; set; } = 0;

    /// <summary>
    /// Gets or sets a flag indicating whether the user record is disabled.
    /// </summary>
    [Display(Name = "Is Disabled")]
    public bool IsDisabled { get; set; }

    /// <summary>
    /// Gets or sets the linked user account of the machine.
    /// The value could be the linked user's unique username or user id.
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    [Display(Name = "Linked User Account")]
    public required string LinkedUserAccount { get; set; }

    /// <summary>
    /// Gets or sets the date and time when the machine record was created. 
    /// This property is intended for use in responses only and should not be included in requests.
    /// </summary>
    [Display(Name = "Created At")]
    public DateTimeOffset CreatedAt { get; set; }
}