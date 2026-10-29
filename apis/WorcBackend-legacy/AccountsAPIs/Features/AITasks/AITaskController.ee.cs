namespace AccountsAPIs.Controllers;

[Route("ai-task")]
[ApiController]
[Authorize(Roles = "SA")]
public class AITaskController : BaseApiController
{
    private readonly IAITaskService _aiTaskService;

    public AITaskController(IAITaskService aiTaskService)
    {
        _aiTaskService = aiTaskService;
    }
    // Checks the availability of a AI task name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsTaskNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _aiTaskService.IsAITaskNameAvailableAsync(checkAvailabilityDto));
    }

    // Fetch all AI tasks
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AITaskTableDto>>>> GetAllAITasks()
    {
        return ResultHelper(await _aiTaskService.GetAllAITasksAsync());
    }

    // Fetch AI task by its ID
    [HttpGet("{aiTaskId}")]
    public async Task<ActionResult<ServiceResponse<AITaskTableDto>>> GetAITask(Guid aiTaskId)
    {
        return ResultHelper(await _aiTaskService.GetAITaskAsync(aiTaskId));
    }

    // Fetch AI task by its name
    [HttpGet("name/{aiTaskName}")]
    public async Task<ActionResult<ServiceResponse<AITaskTableDto>>> GetAITaskByName(string aiTaskName)
    {
        return ResultHelper(await _aiTaskService.GetAITaskByNameAsync(aiTaskName));
    }

    // Create a new AI task
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<AITaskTableDto>>> InsertAITask([FromBody] AITaskTableDto aiTaskDto)
    {
        return ResultHelper(await _aiTaskService.InsertAITaskAsync(aiTaskDto));
    }

    // Update an existing AI task
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<AITaskTableDto>>> UpdateAITask([FromBody] AITaskTableDto aiTaskDto)
    {
        return ResultHelper(await _aiTaskService.UpdateAITaskAsync(aiTaskDto));
    }

    // Delete an AI task by ID
    [HttpDelete("{aiTaskId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAITask(Guid aiTaskId)
    {
        return ResultHelper(await _aiTaskService.DeleteAITaskAsync(aiTaskId));
    }

    // Delete multiple AI tasks by IDs
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteMultipleAITasks([FromBody] IEnumerable<Guid> aiTaskIds)
    {
        return ResultHelper(await _aiTaskService.DeleteMultipleAITasksAsync(aiTaskIds));
    }

    // Search AI tasks by name
    [HttpGet("search/{taskName}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AITaskTableDto>>>> GetAllAITasks(string taskName)
    {
        return ResultHelper(await _aiTaskService.SearchAITasksByNameAsync(taskName));
    }
}