namespace WorkspaceAPIs.Services;

public class FlowBuilderService : IFlowBuilderService
{
    private readonly ILogger<FlowBuilderService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public FlowBuilderService(
        ILogger<FlowBuilderService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves the flow version record to load when the user opens it in the studio.
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
            // Try to get flow version
            var flowVersion = await _unitOfWork.FlowVersionRepo
                                        .GetByConditionAsync(w => w.Id == id && w.CreatedByUserId == _userId)
                                        .SingleOrDefaultAsync();

            // Flow version doesn't exist
            if (flowVersion == null)
            {
                _logger.LogInformation($"Flow not found for Id {id}");
                serviceResponse.Message = "Flow does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = flowVersion.Adapt<LoadFlowDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Updates the flow version nodes, edges, viewport silently in the background whenever the user makes any changes
    public async Task<ServiceResponse<bool>> UpdateFlowSilentlyAsync(FlowSilentUpdateDto flowSilentUpdateDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to update flow version. Please try again"
        };

        try
        {
            // Validate flow version existence
            var flowVersion = await _unitOfWork.FlowVersionRepo
                                        .GetByConditionAsync(w => w.Id == flowSilentUpdateDto.Id && w.CreatedByUserId == _userId)
                                        .SingleOrDefaultAsync();

            // Flow version does not exist
            if (flowVersion == null)
            {
                _logger.LogInformation($"Flow does not exist");
                serviceResponse.Message = "Flow does not exist";
                return serviceResponse;
            }

            // Update flow version
            flowSilentUpdateDto.Adapt(flowVersion);
            flowVersion.LastModifiedByUserId = _userId;
            flowVersion.LastModifiedOn = DateTimeOffset.UtcNow;
            _unitOfWork.FlowVersionRepo.Update(flowVersion);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while silently updating flow version");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow version updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}