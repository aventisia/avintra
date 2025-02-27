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
    public async Task<ActionResult<ServiceResponse<MachineDto>>> CreateNewMachine(MachineDto machineDto)
    {
        return ResultHelper(await _machineService.CreateNewMachineAsync(machineDto));
    }

    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> UpdateMachine(MachineDto machineDto)
    {
        return ResultHelper(await _machineService.UpdateMachineAsync(machineDto));
    }

    // Retrieves list of machines.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MachineDto>>>> GetMachineList()
    {
        return ResultHelper(await _machineService.GetMachineListAsync());
    }

    // Deletes a machine by its ID.
    [HttpGet("{machineId}")]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> GetMachine(Guid machineId)
    {
        return ResultHelper(await _machineService.GetMachineAsync(machineId));
    }

    // Deletes a machine by its ID.
    [HttpDelete("{machineId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMachine(Guid machineId)
    {
        return ResultHelper(await _machineService.DeleteMachineAsync(machineId));
    }

    // Delete multiple machines by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteFlows([FromBody] IEnumerable<Guid> machineIds)
    {
        return ResultHelper(await _machineService.DeleteMachinesAsync(machineIds));
    }

    // // assign or remove a flow of the machine.
    // [HttpPost("operation")]
    // public async Task<ActionResult<ServiceResponse<bool>>> AssignOperationToMachine(MachineOperationDto machineFlowOperationDto)
    // {
    //     return ResultHelper(await _machineService.AssignOperationToMachineAsync(machineFlowOperationDto));
    // }

    // // removes all the task assigned to the machine
    // [HttpDelete("remove-all-operations/{id}")]
    // public async Task<ActionResult<ServiceResponse<bool>>> RemoveAllOperations(Guid id)
    // {
    //     return ResultHelper(await _machineService.RemoveAllOperationsAsync(id));
    // }
}