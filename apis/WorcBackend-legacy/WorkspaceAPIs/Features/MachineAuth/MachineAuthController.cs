namespace WorkspaceAPIs.Controllers;

[Route("machine-auth")]
[ApiController]
[AllowAnonymous, ApiKeyAuthorize("machineAuth", allowJwtAuth: true)]
public class MachineAuthController : BaseApiController
{
    private readonly IMachineAuthService _machineAuthService;

    public MachineAuthController(IMachineAuthService machineAuthService)
    {
        _machineAuthService = machineAuthService;
    }

    // Registers a machine and returns a JWT for its linked user account.
    [HttpPost("register")]
    public async Task<ActionResult<ServiceResponse<MachineAuthResDto>>> RegisterMachine([FromBody] MachineAuthReqDto machineAuthReqDto)
    {
        return ResultHelper(await _machineAuthService.RegisterMachineAsync(machineAuthReqDto));
    }

    // Validates a registered machine and returns a JWT for its linked user account.
    [HttpPost("validate")]
    public async Task<ActionResult<ServiceResponse<MachineAuthResDto>>> ValidateMachine([FromBody] MachineAuthReqDto machineAuthReqDto)
    {
        return ResultHelper(await _machineAuthService.ValidateMachineAsync(machineAuthReqDto));
    }
}
