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
}
