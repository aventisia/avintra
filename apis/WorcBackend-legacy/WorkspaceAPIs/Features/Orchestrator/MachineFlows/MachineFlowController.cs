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
    public async Task<ActionResult<ServiceResponse<MachineFlowDto>>> InsertMachineFlowAsync(MachineFlowDto machineFlowDto)
    {
        return ResultHelper(await _machineFlowService.InsertMachineFlowAsync(machineFlowDto));
    }

    // Update an exiting machine flow
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MachineFlowDto>>> UpdateMachineAsync(MachineFlowDto machineFlowDto)
    {
        return ResultHelper(await _machineFlowService.UpdateMachineAsync(machineFlowDto));
    }

    // Retrieves list of machine flows.
    [HttpGet("list/{machineId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MachineFlowDto>>>> GetMachineList(Guid? machineId)
    {
        return ResultHelper(await _machineFlowService.GetMachineFlowsAsync(machineId));
    }

    // Retrieves a machine flow using composite keys.
    [HttpGet("{machineId}/{flowVersionId}")]
    public async Task<ActionResult<ServiceResponse<MachineFlowDto>>> GetMachineFlowAsync(Guid machineId, Guid flowVersionId)
    {
        return ResultHelper(await _machineFlowService.GetMachineFlowAsync(machineId, flowVersionId));
    }

    // Deletes a machine flow using composite keys.
    [HttpDelete("{machineId}/{flowVersionId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMachineFlowAsync(Guid machineId, Guid flowVersionId)
    {
        return ResultHelper(await _machineFlowService.DeleteMachineFlowAsync(machineId, flowVersionId));
    }

    // Delete multiple machine flows by their composite keys.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMachineFlowsAsync([FromBody] IEnumerable<MachineFlowKeyDto> machineFlowKeys)
    {
        return ResultHelper(await _machineFlowService.DeleteMachineFlowsAsync(machineFlowKeys));
    }
}