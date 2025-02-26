namespace WorkspaceAPIs.Controllers;

[Route("machine"), ApiController, Authorize]
public class MachineController : BaseApiController
{
    private readonly IMachineService _machineService;

    public MachineController(IMachineService machineService)
    {
        _machineService = machineService;
    }

    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> CreateNewMachine(CreateMachineDto createMachineDto)
    {
        return ResultHelper(await _machineService.CreateNewMachineAsync(createMachineDto));
    }

    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> UpdateMachine(UpdateMachineDto updateMachineDto)
    {
        return ResultHelper(await _machineService.UpdateMachineAsync(updateMachineDto));
    }

    // Retrieves list of machines.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MachineDto>>>> GetMachineList(Guid tenantId)
    {
        return ResultHelper(await _machineService.GetMachineListAsync(tenantId));
    }

    // Deletes a machine by its ID.
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> GetMachine(Guid id)
    {
        return ResultHelper(await _machineService.GetMachineAsync(id));
    }

    // assign or remove a flow of the machine.
    [HttpPost("operation")]
    public async Task<ActionResult<ServiceResponse<bool>>> AssignOperationToMachine(MachineOperationDto machineFlowOperationDto)
    {
        return ResultHelper(await _machineService.AssignOperationToMachineAsync(machineFlowOperationDto));
    }

    // Deletes a machine by its ID.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMachine(Guid id)
    {
        return ResultHelper(await _machineService.DeleteMachineAsync(id));
    }

    // removes all the task assigned to the machine
    [HttpDelete("remove-all-operations/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> RemoveAllOperations(Guid id)
    {
        return ResultHelper(await _machineService.RemoveAllOperationsAsync(id));
    }
}