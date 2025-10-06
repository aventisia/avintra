
namespace WorkspaceAPIs.Services;

public class FlowExecutionLogService : IFlowExecutionLogService
{
    private readonly ILogger<FlowExecutionLogService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly string? _username;

    public FlowExecutionLogService(
        ILogger<FlowExecutionLogService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Set username
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? null;

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Get a list of exexution logs of a single flow using flow identifier
    public async Task<ServiceResponse<IEnumerable<FlowExecutionLogDto>>> GetFlowExecutionLogsAsync(Guid flowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowExecutionLogDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get flow execution logs
            var logs = await _unitOfWork.FlowExecutionLogRepo
            .GetByConditionAsync(v => v.FlowId == flowId)
            .OrderBy(o => o.ExecutedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = logs.Adapt<IEnumerable<FlowExecutionLogDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow Execution logs retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Get all list of flow execution logs 

    public async Task<ServiceResponse<IEnumerable<FlowExecutionLogDto>>> GetFlowExecutionLogListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<FlowExecutionLogDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get flow execution logs
            var logs = await _unitOfWork.FlowExecutionLogRepo
            .GetAllAsync()
            .OrderBy(o => o.ExecutedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = logs.Adapt<IEnumerable<FlowExecutionLogDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow Execution logs retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a flow execution log
    public async Task<ServiceResponse<FlowExecutionLogDto>> InsertFlowExecutionLogAsync(FlowExecutionLogDto flowExecutionLogDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowExecutionLogDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newLog = flowExecutionLogDto.Adapt<FlowExecutionLog>();
            newLog.ExecutedBy = _username;
            newLog.ExecutedOn = DateTimeOffset.UtcNow;
            newLog.StartTime = DateTimeOffset.UtcNow;
            newLog.EndTime = DateTimeOffset.UtcNow;

            //Insert an execution log
            await _unitOfWork.FlowExecutionLogRepo.InsertAsync(newLog);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting an execution log");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newLog.Adapt<FlowExecutionLogDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow Execution log added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            Console.WriteLine(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates a flow execution log
    public async Task<ServiceResponse<FlowExecutionLogDto>> UpdateFlowExecutionLogAsync(FlowExecutionLogDto flowExecutionLogDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FlowExecutionLogDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate execution log existence
            var log = await _unitOfWork.FlowExecutionLogRepo
                .GetByConditionAsync(v => v.Id == flowExecutionLogDto.Id)
                .SingleOrDefaultAsync();

            // execution log does not exist
            if (log == null)
            {
                _logger.LogInformation($"A flow execution log does not exist");
                serviceResponse.Message = "A flow execution log does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newLog = flowExecutionLogDto.Adapt(log);

            //create a new flow execution log
            _unitOfWork.FlowExecutionLogRepo.Update(newLog);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating an execution log");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newLog.Adapt<FlowExecutionLogDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "A flow execution log updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Deletes a flow execution log
    public async Task<ServiceResponse<bool>> DeleteFlowExecutionLogAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get a flow execution log using identifier
            var log = await _unitOfWork.FlowExecutionLogRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if log not exists
            if (log == null)
            {
                _logger.LogInformation($"A flow execution log does not exist");
                serviceResponse.Message = "A flow execution log does not exist";
                return serviceResponse;
            }

            //Delete a flow execution log
            _unitOfWork.FlowExecutionLogRepo.Delete(log);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting an execution log");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Flow execution log deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

   
   //Delete multiple flow execution log
    public async Task<ServiceResponse<bool>> DeleteFLowExecutionLogListAsync(List<Guid> ids)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete flow execution logs. Please try again"
        };

        try
        {
            // Fetch FlowExecutionLogs with Flow and FlowUsers for permission checks
            var flowExecutionLogs = await _unitOfWork.FlowExecutionLogRepo
                .GetByConditionAsync(log => ids.Contains(log.Id))
                .Include(log => log.Flow)
                    .ThenInclude(flow => flow.FlowUsers)
                .ToListAsync();

            if (!flowExecutionLogs.Any())
            {
                _logger.LogInformation("No flow execution logs found for the provided IDs.");
                serviceResponse.Message = "No flow execution logs found for deletion.";
                return serviceResponse;
            }

            

            // Perform deletion
            _unitOfWork.FlowExecutionLogRepo.Delete(flowExecutionLogs);

            // Commit to database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("SaveChanges failed while deleting flow execution logs.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{flowExecutionLogs.Count} flow execution log(s) deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An exception occurred while deleting flow execution logs.");
            serviceResponse.Message = "An error occurred while deleting the flow execution logs.";
        }

        return serviceResponse;

    }
}