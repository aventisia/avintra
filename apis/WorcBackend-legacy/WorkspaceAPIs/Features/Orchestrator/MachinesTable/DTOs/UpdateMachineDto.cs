namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents the payload used to update a machine.
/// Only the assigned flow versions and the disabled state are editable through
/// the web frontend. Identity fields are managed by the desktop-app registration.
/// </summary>
public class UpdateMachineDto
{
    /// <summary>
    /// Gets or sets the unique identifier of the machine.
    /// </summary>
    [RequiredGuid]
    public Guid Id { get; set; }

    /// <summary>
    /// Many-to-Many relationship: Represents the list of flow version identifiers associated with the machine.
    /// Each identifier is a GUID that uniquely represents a flow version.
    /// </summary>
    public List<Guid> FlowVersionIds { get; set; } = new List<Guid>();

    /// <summary>
    /// Gets or sets a flag indicating whether the machine is disabled.
    /// </summary>
    public bool? IsDisabled { get; set; }
}
