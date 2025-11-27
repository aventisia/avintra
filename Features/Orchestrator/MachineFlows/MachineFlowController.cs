namespace WorkspaceAPIs.Controllers;

[Route("machine-flow"), ApiController, Authorize]
public class MachineFlowController : BaseApiController
{
    private readonly IMachineFlowService _machineFlowService;

    public MachineFlowController(IMachineFlowService machineFlowService)
    {
        _machineFlowService = machineFlowService;
    }

    // Insert new machine flow
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> InsertMachineFlowAsync(MachineFlowDto machineFlowDto)
    {
        return ResultHelper(await _machineFlowService.InsertMachineFlowAsync(machineFlowDto));
    }

    // Update an exiting machine flow
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> UpdateMachineAsync(MachineFlowDto machineFlowDto)
    {
        return ResultHelper(await _machineFlowService.UpdateMachineAsync(machineFlowDto));
    }

    // Retrieves list of machine flows.
    [HttpGet("list/{machineId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MachineDto>>>> GetMachineList(Guid? machineId)
    {
        return ResultHelper(await _machineFlowService.GetMachineFlowsAsync(machineId));
    }

    // Deletes a machine flow by its ID.
    [HttpGet("{machineFlowId}")]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> GetMachineFlowAsync(Guid machineFlowId)
    {
        return ResultHelper(await _machineFlowService.GetMachineFlowAsync(machineFlowId));
    }

    // Deletes a machine flow by its ID.
    [HttpDelete("{machineFlowId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMachineFlowAsync(Guid machineFlowId)
    {
        return ResultHelper(await _machineFlowService.DeleteMachineFlowAsync(machineFlowId));
    }

    // Delete multiple machine flows by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMachineFlowsAsync([FromBody] IEnumerable<Guid> machineFlowIds)
    {
        return ResultHelper(await _machineFlowService.DeleteMachineFlowsAsync(machineFlowIds));
    }
}