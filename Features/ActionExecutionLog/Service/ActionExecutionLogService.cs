namespace WorkspaceAPIs.Services;

public class ActionExecutionLogService : IActionExecutionLogService
{
    private readonly ILogger<ActionExecutionLogService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly string? _username;

    public ActionExecutionLogService(
        ILogger<ActionExecutionLogService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        
        // Set username
        _username = httpContextAccessor.HttpContext?.User?.FindFirstValue("username") ?? null;

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Get a list of action execution logs of a single flow using flow identifier
    public async Task<ServiceResponse<IEnumerable<ActionExecutionLogDto>>> GetActionExecutionLogsAsync(Guid flowId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<ActionExecutionLogDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get action execution logs
            var logs = await _unitOfWork.ActionExecutionLogRepo
            .GetByConditionAsync(v => v.FlowExecutionLogId == flowId)
            .OrderBy(o => o.ExecutedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = logs.Adapt<IEnumerable<ActionExecutionLogDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Action execution logs retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a flow version
    public async Task<ServiceResponse<ActionExecutionLogDto>> InsertActionExecutionLogAsync(ActionExecutionLogDto executionLogDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ActionExecutionLogDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newLog = executionLogDto.Adapt<ActionExecutionLog>();
            newLog.ExecutedBy = _username;
            newLog.ExecutedOn = DateTimeOffset.UtcNow;

            //Insert an action execution log
            await _unitOfWork.ActionExecutionLogRepo.InsertAsync(newLog);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting an action execution log");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newLog.Adapt<ActionExecutionLogDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Action execution log added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            Console.WriteLine(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates an action execution log
    public async Task<ServiceResponse<ActionExecutionLogDto>> UpdateActionExecutionLogAsync(ActionExecutionLogDto executionLogDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ActionExecutionLogDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate action execution log existence
            var log = await _unitOfWork.ActionExecutionLogRepo
                .GetByConditionAsync(v => v.Id == executionLogDto.Id)
                .SingleOrDefaultAsync();

            // action execution log does not exist
            if (log == null)
            {
                _logger.LogInformation($"An action execution log does not exist");
                serviceResponse.Message = "An action execution log does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newLog = executionLogDto.Adapt(log);

            //create a new action execution log
            _unitOfWork.ActionExecutionLogRepo.Update(newLog);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating an action execution log");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newLog.Adapt<ActionExecutionLogDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "An action execution log updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Deletes a action execution log
    public async Task<ServiceResponse<bool>> DeleteActionExecutionLogAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get an action execution log using identifier
            var log = await _unitOfWork.ActionExecutionLogRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if log not exists
            if (log == null)
            {
                _logger.LogInformation($"An action execution log does not exist");
                serviceResponse.Message = "An action execution log does not exist";
                return serviceResponse;
            }

            //Delete log
            _unitOfWork.ActionExecutionLogRepo.Delete(log);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting an execution log");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Action execution log deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}