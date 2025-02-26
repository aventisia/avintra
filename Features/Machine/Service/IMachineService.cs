
namespace WorkspaceAPIs.Services;

public interface IMachineService
{
    Task<ServiceResponse<MachineDto>> CreateNewMachineAsync(CreateMachineDto createMachineDto);
    Task<ServiceResponse<IEnumerable<MachineDto>>> GetMachineListAsync(Guid tenantId);
    Task<ServiceResponse<bool>> AssignOperationToMachineAsync(MachineOperationDto operation);
    Task<ServiceResponse<bool>> DeleteMachineAsync(Guid id);
    Task<ServiceResponse<MachineDto>> GetMachineAsync(Guid id);
    Task<ServiceResponse<MachineDto>> UpdateMachineAsync(UpdateMachineDto updateMachineDto);
    Task<ServiceResponse<bool>> RemoveAllOperationsAsync(Guid id);
    Task<MachineStatusTypeEnum> GetMachineStatusAsync(Guid machineId);
}