namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a data transfer object (DTO) for a MachineFlowOperationDto.
/// </summary>
public class MachineOperationDto
{
    [RequiredGuid]
    public Guid FlowGuid { get; set; }

    [RequiredGuid]
    public Guid MachineGuid { get; set; }

    [Required, EnumDataType(typeof(MachineOperationType))]
    public MachineOperationType OperationType { get; set; }

}