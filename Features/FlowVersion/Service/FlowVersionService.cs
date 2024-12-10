namespace WorkspaceAPIs.Services;

public class FlowVersionService : IFlowVersionService
{
    private readonly ILogger<FlowVersionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public FlowVersionService(
        ILogger<FlowVersionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Get a list of flow versions of a single flow using flow identifier
    public async Task<ServiceResponse<IEnumerable<FlowVersionDto>>> GetFlowVersionsAsync(Guid flowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowVersionDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get flow versions
            var flowVersions = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(v => v.Flow.Id == flowId).Include(w => w.CreatedByUser)
            .OrderBy(o => o.CreatedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = flowVersions.Adapt<IEnumerable<FlowVersionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Versions retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a flow version
    public async Task<ServiceResponse<FlowVersionDto>> InsertFlowVersionAsync(FlowVersionDto flowVersionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowVersionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newFlowVersion = flowVersionDto.Adapt<FlowVersion>();
            newFlowVersion.CreatedByUserId = _userId;
            newFlowVersion.LastModifiedByUserId = _userId;

            //Insert a flow version
            await _unitOfWork.FlowVersionRepo.InsertAsync(newFlowVersion);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new flow version");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newFlowVersion.Adapt<FlowVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            Console.WriteLine(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates a flow version
    public async Task<ServiceResponse<FlowVersionDto>> UpdateFlowVersionAsync(FlowVersionDto flowVersionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowVersionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate flow version existence
            var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(v => v.Id == flowVersionDto.Id && v.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // Flow version does not exist
            if (flowVersion == null)
            {
                _logger.LogInformation($"Flow version does not exist");
                serviceResponse.Message = "Version does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newFlowVersion = flowVersionDto.Adapt(flowVersion);

            //update a flow version
            _unitOfWork.FlowVersionRepo.Update(newFlowVersion);
            newFlowVersion.CreatedByUserId = _userId;
            newFlowVersion.LastModifiedByUserId = _userId;

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating flow version");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newFlowVersion.Adapt<FlowVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Deletes a flow version
    public async Task<ServiceResponse<bool>> DeleteFlowVersionAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get version using identifier
            var flowVersion = await _unitOfWork.FlowVersionRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if version not exists
            if (flowVersion == null)
            {
                _logger.LogInformation($"Flow version does not exist");
                serviceResponse.Message = "Version does not exist";
                return serviceResponse;
            }

            //Delete version
            _unitOfWork.FlowVersionRepo.Delete(flowVersion);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting flow version");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Version deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}