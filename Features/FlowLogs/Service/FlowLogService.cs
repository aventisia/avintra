namespace WorkspaceAPIs.Services;

public class FlowLogService : IFlowLogService
{
    private readonly ILogger<FlowLogService> _logger;
    private readonly IUnitOfWork _unitOfWork;
     private readonly Guid _userId;

     public FlowLogService(ILogger<FlowLogService> logger,
     IUnitOfWork unitOfWork,
     IHttpContextAccessor httpContextAccessor)
     {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
     }
}