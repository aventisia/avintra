namespace WorkspaceAPIs.Controllers
;

[Route("queue")]
[ApiController]
[Authorize]
public class QueueTableController : BaseApiController
{
    private readonly IQueueTableService _queueTableService;

    public QueueTableController(IQueueTableService queueTableService)
    {
        _queueTableService = queueTableService;
    }

    // Retrieves personal queues.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueuesTableDto>>>> GetPersonalQueuesAsync()
    {
        return ResultHelper(await _queueTableService.GetAllQueuesAsync(true));
    }

    // Retrieves shared queues.
    [HttpGet("list/shared")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueuesTableDto>>>> GetSharedQueuesAsync()
    {
        return ResultHelper(await _queueTableService.GetAllQueuesAsync(false));
    }

    // Retrieves queues assigned to a specific agent (flow version).
    [HttpGet("by-agent/{flowVersionId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueuesTableDto>>>> GetQueuesByAgentAsync(Guid flowVersionId)
    {
        return ResultHelper(await _queueTableService.GetQueuesByAgentAsync(flowVersionId));
    }


    // Searches for queues by name.
    [HttpGet("search/{queueName}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueuesTableDto>>>> SearchQueuesAsync(string queueName, [FromQuery] bool isPersonal = true)
    {
        return ResultHelper(await _queueTableService.SearchQueuesAsync(queueName, isPersonal));
    }

    // Retrieves a specific queue by its ID.
    [HttpGet("{queueId}")]
    public async Task<ActionResult<ServiceResponse<QueuesTableDto>>> GetQueueByIdAsync(Guid queueId)
    {
        return ResultHelper(await _queueTableService.GetQueueByIdAsync(queueId));
    }

    // Retrieves a specific queue by its name.
    [HttpGet("by-name/{queueName}")]
    public async Task<ActionResult<ServiceResponse<QueuesTableDto>>> GetQueueByNameAsync(string queueName)
    {
        return ResultHelper(await _queueTableService.GetQueueByNameAsync(queueName));
    }

    // Checks the availability of a queue name.
    [HttpPost("is-available")]
    public async Task<ActionResult<ServiceResponse<TrueFalseResultDto>>> IsQueueNameAvailable([FromBody] CheckAvailabilityDto checkAvailabilityDto)
    {
        return ResultHelper(await _queueTableService.IsQueueNameAvailableAsync(checkAvailabilityDto));
    }

    // Inserts a new queue.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<QueuesTableDto>>> InsertQueueAsync([FromBody] QueuesTableDto queuesTableDto)
    {
        return ResultHelper(await _queueTableService.InsertQueueAsync(queuesTableDto));
    }

    // Updates an existing queue.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<QueuesTableDto>>> UpdateQueueAsync([FromBody] QueuesTableDto queuesTableDto)
    {
        return ResultHelper(await _queueTableService.UpdateQueueAsync(queuesTableDto));
    }

    // Deletes a queue by its ID.
    [HttpDelete("{queueId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteQueueAsync(Guid queueId)
    {
        return ResultHelper(await _queueTableService.DeleteQueueAsync(queueId));
    }

    // Deletes multiple queues by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteQueues([FromBody] List<Guid> queueIds)
    {
        return ResultHelper(await _queueTableService.DeleteQueuesAsync(queueIds));
    }

    // Assigns multiple users to a specific queue using the queueId and a list of userIds.
    [HttpPost("{queueId}/assign-users")]
    public async Task<ActionResult<ServiceResponse<bool>>> AssignUsers(Guid queueId, [FromBody] IEnumerable<Guid> userIds)
    {
        return ResultHelper(await _queueTableService.AssignUsersAsync(queueId, userIds));
    }

    // Retrieves a list of users associated with a specific queue identified by queueId.
    [HttpGet("{queueId}/users")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignUserQueueDto>>>> GetUsers(Guid queueId)
    {
        return ResultHelper(await _queueTableService.GetUsersAsync(queueId));
    }
}
