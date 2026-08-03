namespace WorkspaceAPIs.Controllers;

[Route("machine"), ApiController, Authorize(Roles = "OM")]
public class MachinesTableController : BaseApiController
{
    private readonly IMachinesTableService _machinesTableService;

    public MachinesTableController(IMachinesTableService machinesTableService)
    {
        _machinesTableService = machinesTableService;
    }

    // Retrieves list of machines.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MachinesTableRowDto>>>> GetMachines()
    {
        return ResultHelper(await _machinesTableService.GetMachinesAsync());
    }

    // Retrieves a machine by its ID.
    [HttpGet("{machineId}")]
    public async Task<ActionResult<ServiceResponse<MachineRecordDto>>> GetMachine(Guid machineId)
    {
        return ResultHelper(await _machinesTableService.GetMachineAsync(machineId));
    }

    // Updates an existing machine.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MachinesTableRowDto>>> UpdateMachine([FromBody] UpdateMachineDto updateMachineDto)
    {
        return ResultHelper(await _machinesTableService.UpdateMachineAsync(updateMachineDto));
    }

    // Deletes an existing machine.
    [HttpDelete("{machineId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMachine(Guid machineId)
    {
        return ResultHelper(await _machinesTableService.DeleteMachineAsync(machineId));
    }

    // Deletes multiple machines by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<long>>> DeleteMachines([FromBody] IEnumerable<Guid> machineIds)
    {
        return ResultHelper(await _machinesTableService.DeleteMachinesAsync(machineIds));
    }
}
