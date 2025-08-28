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

    // Retrieves all queues.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueuesTableDto>>>> GetAllQueuesAsync()
    {
        return ResultHelper(await _queueTableService.GetAllQueuesAsync());
    }

    // Searches for queues by name.
    [HttpGet("search/{queueName}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueuesTableDto>>>> SearchQueuesAsync(string queueName)
    {
        return ResultHelper(await _queueTableService.SearchQueuesAsync(queueName));
    }

    // Retrieves a specific queue by its ID.
    [HttpGet("{queueId}")]
    public async Task<ActionResult<ServiceResponse<QueuesTableDto>>> GetQueueByIdAsync(Guid queueId)
    {
        return ResultHelper(await _queueTableService.GetQueueByIdAsync(queueId));
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


    // Assigns multiple agents to a specific queue using the queueId and a list of agentIds.
    [HttpPost("{queueId}/assign-agents")]
    public async Task<ActionResult<ServiceResponse<bool>>> AssignAgents(Guid queueId, [FromBody] IEnumerable<Guid> agentIds)
    {
        return ResultHelper(await _queueTableService.AssignAgentsAsync(queueId, agentIds));
    }

    // Retrieves a list of agents associated with a specific queue identified by agentIds.
    [HttpGet("{queueId}/agents")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<AssignAgentQueueDto>>>> GetAgents(Guid queueId)
    {
        return ResultHelper(await _queueTableService.GetAgentsAsync(queueId));
    }
}
