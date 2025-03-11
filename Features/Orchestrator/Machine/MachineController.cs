namespace WorkspaceAPIs.Controllers;

[Route("machine"), ApiController, Authorize]
public class MachineController : BaseApiController
{
    private readonly IMachineService _machineService;

    public MachineController(IMachineService machineService)
    {
        _machineService = machineService;
    }

    // Checks the availability of a machine name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsMachineNameAvailableAsync([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _machineService.IsMachineNameAvailableAsync(checkAvailabilityDto));
    }

    // Insert new machine
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<MachineDto>>> CreateNewMachine(MachineDto machineDto)
    {
        return ResultHelper(await _machineService.CreateNewMachineAsync(machineDto));
    }

    // Update an exiting machine
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
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMachinesAsync([FromBody] IEnumerable<Guid> machineIds)
    {
        return ResultHelper(await _machineService.DeleteMachinesAsync(machineIds));
    }

    // Assign multiple agent to machine by their IDs.
    [HttpPost("{machineId}/assign-agent")]
    public async Task<ActionResult<ServiceResponse<bool>>> AssignAgentsToMachineAsync(Guid machineId,[FromBody] IEnumerable<Guid> agentIds)
    {
        return ResultHelper(await _machineService.AssignAgentsToMachineAsync(machineId, agentIds));
    }

    // Delete multiple agent from machine by their IDs.
    [HttpPost("{machineId}/remove-agent")]
    public async Task<ActionResult<ServiceResponse<bool>>> RemoveAgentsFromMachineAsync(Guid machineId ,[FromBody] IEnumerable<Guid> agentIds)
    {
        return ResultHelper(await _machineService.RemoveAgentsFromMachineAsync(machineId, agentIds));
    }

    // Retrieve agent list by machine ID.
    [HttpGet("{machineId}/agents")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignAgentDto>>>> GetAgentsByMachineAsync(Guid machineId)
    {
        return ResultHelper(await _machineService.GetAgentsByMachineAsync(machineId));
    }

    // Retrieve the select-option list of machines
    [HttpGet("select-option")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SelectOptionDto>>>> GetAgentToSelectOptionAsync()
    {
        return ResultHelper(await _machineService.GetMachineToSelectOptionAsync());
    }
}