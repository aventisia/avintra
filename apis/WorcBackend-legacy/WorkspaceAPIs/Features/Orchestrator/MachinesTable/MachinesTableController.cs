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

    // Retrieve machine by its ID.
    [HttpGet("{machineId}")]
    public async Task<ActionResult<ServiceResponse<MachineRecordDto>>> GetMachine(Guid machineId)
    {
        return ResultHelper(await _machinesTableService.GetMachineAsync(machineId));
    }

    // Insert new machine
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MachinesTableRowDto>>> InsertMachine([FromBody] AddMachineDto addMachineDto)
    {
        return ResultHelper(await _machinesTableService.InsertMachineAsync(addMachineDto));
    }

    // Update an exiting machine
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MachinesTableRowDto>>> UpdateMachine([FromBody] UpdateMachineDto updateMachineDto)
    {
        return ResultHelper(await _machinesTableService.UpdateMachineAsync(updateMachineDto));
    }

    // Deletes a machine by its ID.
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

    // TODO: Need to check later. This endpoint should be in the TenantUser/FlowVersionController, not in the MachinesTableController. It is used to retrieve the list of flow versions associated with a specific machine for the TenantUser role.


    // TODO: Need to check later
    // Searches for machines based on the specified search keyword.
    [HttpGet("search/{searchKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MachinesTableRowDto>>>> FindMachinesByKeyword(string searchKey)
    {
        return ResultHelper(await _machinesTableService.FindMachinesByKeywordAsync(searchKey));
    }

}
