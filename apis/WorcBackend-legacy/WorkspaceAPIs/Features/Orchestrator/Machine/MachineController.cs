namespace WorkspaceAPIs.Controllers;

[Route("machine"), ApiController, Authorize(Roles = "OM")]
public class MachineController : BaseApiController
{
    private readonly IMachineService _machineService;

    public MachineController(IMachineService machineService)
    {
        _machineService = machineService;
    }

    // Retrieves list of machines.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MachineDto>>>> GetMachines()
    {
        return ResultHelper(await _machineService.GetMachinesAsync());
    }

    // Retrieve machine by its ID.
    [HttpGet("{machineId}")]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> GetMachine(Guid machineId)
    {
        return ResultHelper(await _machineService.GetMachineAsync(machineId));
    }

    // Insert new machine
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> InsertMachine([FromBody] AddMachineDto addMachineDto)
    {
        return ResultHelper(await _machineService.InsertMachineAsync(addMachineDto));
    }

    // Update an exiting machine
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> UpdateMachine([FromBody] UpdateMachineDto updateMachineDto)
    {
        return ResultHelper(await _machineService.UpdateMachineAsync(updateMachineDto));
    }

    // Deletes a machine by its ID.
    [HttpDelete("{machineId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMachine(Guid machineId)
    {
        return ResultHelper(await _machineService.DeleteMachineAsync(machineId));
    }

    // Deletes multiple machines by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMachines([FromBody] IEnumerable<Guid> machineIds)
    {
        return ResultHelper(await _machineService.DeleteMachinesAsync(machineIds));
    }

    // Synchronize machine's flow versions
    [HttpPost("sync-flow-versions")]
    public async Task<ActionResult<ServiceResponse<bool>>> SyncMachineFlowVersions([FromBody] UpdateMachineFlowVersionsDto updateMachineFlowVersionsDto)
    {
        return ResultHelper(await _machineService.SyncMachineFlowVersionsAsync(updateMachineFlowVersionsDto));
    }

    // TODO: Need to check later. This endpoint should be in the TenantUser/FlowVersionController, not in the MachineController. It is used to retrieve the list of flow versions associated with a specific machine for the TenantUser role.
    // Retrieve flow version list by machine os ID.
    [HttpGet("{osId}/flow-versions")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignFlowVersionDto>>>> GetFlowVersionsByMachineOSId(string osId)
    {
        return ResultHelper(await _machineService.GetFlowVersionsByMachineOSIdAsync(osId));
    }

    // TODO: Need to check later
    // Retrieve the select-option list of machines
    [HttpGet("select-option")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOptionDto>>>> GetMachineToSelectOption()
    {
        return ResultHelper(await _machineService.GetMachineToSelectOptionAsync());
    }

    // TODO: Need to check later
    // Searches for machines based on the specified search keyword.
    [HttpGet("search/{searchKey}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<MachineDto>>>> FindMachinesByKeyword(string searchKey)
    {
        return ResultHelper(await _machineService.FindMachinesByKeywordAsync(searchKey));
    }

}
