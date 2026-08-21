namespace WorkspaceAPIs.Services;

public class FlowLogService : IFlowLogService
{
    private readonly ILogger<FlowLogService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    //private readonly Guid _userId;

    public FlowLogService(ILogger<FlowLogService> logger,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        // _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrive list of flow log by flowId
    public async Task<ServiceResponse<IEnumerable<FlowLogDto>>> GetFlowLogAsync(Guid flowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowLogDto>>
        {
            Data = null,
            Message = "Failed to fetch flow log. Please try again",
            StatusCode = 400
        };

        try
        {
            // Fetch the flows from the repository using both flowId and flowName for filtering
            var flows = await _unitOfWork.FlowLogRepo.GetByConditionAsync(w => w.FlowId == flowId)
            .Include(f => f.Flow).ToListAsync();

            // Task successful          
            serviceResponse.Data = flows.Adapt<IEnumerable<FlowLogDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow log retrieved successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurred while fetching the flow log.";
        }

        return serviceResponse;
    }

    // Create a new flow log
    public async Task<ServiceResponse<FlowLogDto>> InsertFlowLogAsync(FlowLogDto flowLogDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowLogDto>
        {
            Data = null,
            Message = "Failed to insert flow log. Please try again"
        };
        try
        {
            // Trim dto' string props
            flowLogDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowLogDto);

            // Default mapping
            var newFlowLog = flowLogDto.Adapt<FlowLog>();

            // Insert flow
            await _unitOfWork.FlowLogRepo.InsertAsync(newFlowLog);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newFlowLog.Adapt<FlowLogDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow log created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;

    }

    // Update a flow log
    public async Task<ServiceResponse<FlowLogDto>> UpdateFlowLogAsync(FlowLogDto flowLogDto)
    {
        //Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowLogDto>
        {
            Data = null,
            Message = "Failed to update flow log. Please try again"
        };
        try
        {
            //Validate flow lo existence
            var flowLog = await _unitOfWork.FlowLogRepo.GetByConditionAsync(w => w.Id == flowLogDto.Id).SingleOrDefaultAsync();
            //GetByConditionAsync(w => w.Id == flowLogDto.Id).SingleOrDefaultAsync();

            // flow log does not exist
            if (flowLog == null)
            {
                serviceResponse.Message = "flow log not exist";
                return serviceResponse;
            }

            var newFlowLog = flowLogDto.Adapt(flowLog);

            //Trim dto' string props
            flowLogDto = TrimDtoStringPropsUtil.TrimDtoStringProps(flowLogDto);

            //Update flow log
            _unitOfWork.FlowLogRepo.Update(flowLog);

            //  Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            //Task successful
            serviceResponse.Data = flowLog.Adapt<FlowLogDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow log updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            serviceResponse.Message = "An error occurs while updating flow log";
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Deletes flow log permanently
    public async Task<ServiceResponse<bool>> DeleteFlowLogAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow log. Please try again"
        };

        try
        {
            // Validate flow log existence
            var flowLog = await _unitOfWork.FlowLogRepo
                .GetByConditionAsync(w => w.Id == id)
                .SingleOrDefaultAsync();

            // Flow log does not exist
            if (flowLog == null)
            {
                serviceResponse.Message = "Log does not exist";
                return serviceResponse;
            }

            // Delete flow log
            _unitOfWork.FlowLogRepo.Delete(flowLog);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow log deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }


}