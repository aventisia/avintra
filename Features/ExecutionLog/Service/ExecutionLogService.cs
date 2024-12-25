namespace WorkspaceAPIs.Services;

public class ExecutionLogService : IExecutionLogService
{
    private readonly ILogger<ExecutionLogService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ExecutionLogService(
        ILogger<ExecutionLogService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Get a list of exexution logs of a single flow using flow identifier
    public async Task<ServiceResponse<IEnumerable<ExecutionLogDto>>> GetExecutionLogsAsync(Guid flowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<ExecutionLogDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get execution logs
            var logs = await _unitOfWork.ExecutionLogRepo
            .GetByConditionAsync(v => v.FlowId == flowId)
            .OrderBy(o => o.CreatedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = logs.Adapt<IEnumerable<ExecutionLogDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Execution logs retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a flow version
    public async Task<ServiceResponse<ExecutionLogDto>> InsertExecutionLogAsync(ExecutionLogDto executionLogDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ExecutionLogDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newLog = executionLogDto.Adapt<ExecutionLog>();
            newLog.CreatedByUserId = _userId;
            newLog.LastModifiedByUserId = _userId;

            //Insert an execution log
            await _unitOfWork.ExecutionLogRepo.InsertAsync(newLog);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting an execution log");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newLog.Adapt<ExecutionLogDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Execution log added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            Console.WriteLine(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates an execution log
    public async Task<ServiceResponse<ExecutionLogDto>> UpdateExecutionLogAsync(ExecutionLogDto executionLogDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ExecutionLogDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate execution log existence
            var log = await _unitOfWork.ExecutionLogRepo
                .GetByConditionAsync(v => v.Id == executionLogDto.Id)
                .SingleOrDefaultAsync();

            // execution log does not exist
            if (log == null)
            {
                _logger.LogInformation($"An execution log does not exist");
                serviceResponse.Message = "An execution log does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newLog = executionLogDto.Adapt(log);

            //create a new execution log
            _unitOfWork.ExecutionLogRepo.Update(newLog);
            newLog.CreatedByUserId = _userId;
            newLog.LastModifiedByUserId = _userId;

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating an execution log");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newLog.Adapt<ExecutionLogDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "An execution log updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Deletes a execution log
    public async Task<ServiceResponse<bool>> DeleteExecutionLogAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get an execution log using identifier
            var log = await _unitOfWork.ExecutionLogRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if log not exists
            if (log == null)
            {
                _logger.LogInformation($"An execution log does not exist");
                serviceResponse.Message = "An execution log does not exist";
                return serviceResponse;
            }

            //Delete log
            _unitOfWork.ExecutionLogRepo.Delete(log);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting an execution log");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Execution log deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}