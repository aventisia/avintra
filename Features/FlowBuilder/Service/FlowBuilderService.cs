namespace WorkspaceAPIs.Services;

public class FlowBuilderService : IFlowBuilderService
{
    private readonly ILogger<FlowBuilderService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly Guid _userId;

    public FlowBuilderService(
        ILogger<FlowBuilderService> logger,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _mapper = mapper;

        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves the flow record to load when the user opens it in the studio.
    public async Task<ServiceResponse<LoadFlowDto>> GetFlowToLoadAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<LoadFlowDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get flow
            var flow = await _unitOfWork.FlowRepo
                                        .GetByConditionAsync(w => w.Id == id)
                                        .SingleOrDefaultAsync();

            // Flow doesn't exist
            if (flow == null)
            {
                _logger.LogInformation($"Flow not found for Id {id}");
                serviceResponse.Message = "Flow does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = _mapper.Map<LoadFlowDto>(flow);
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }
}