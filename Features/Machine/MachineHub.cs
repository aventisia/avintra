namespace WorkspaceAPIs.Hubs;

[Authorize]
public class MachineHub : Hub
{
    private readonly IMachineService _machineService;
    private readonly Guid _userId;
    private readonly IUnitOfWork _unitOfWork;

    public MachineHub(MachineService machineService, IUnitOfWork unitOfWork, IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _machineService = machineService;
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    public override async Task OnConnectedAsync()
    {
        await Clients.Caller.SendAsync("connection", "Connected to the machine hub.");
    }

    public async Task MachineStatus(Guid machineId)
    {
        var status = await _machineService.GetMachineStatusAsync(machineId);
        await Clients.Caller.SendAsync("machineStatus", status);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await Clients.Others.SendAsync("connection", "Disconnected!");
        await base.OnDisconnectedAsync(exception);
    }
}