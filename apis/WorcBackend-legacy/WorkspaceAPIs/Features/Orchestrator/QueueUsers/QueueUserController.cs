namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("queue-user")]
public class QueueUserController : BaseApiController
{
    private readonly IQueueUserService _queueUserService;

    public QueueUserController(IQueueUserService queueUserService)
    {
        _queueUserService = queueUserService;
    }

    // Get my quesu list
    [HttpGet("my-queues")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueuesTableDto>>>> GetMyQueues(
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null)
    {
        return ResultHelper(await _queueUserService.GetMyQueuesAsync(from, to));
    }

    // Get my agent queues list
    [HttpGet("my-agent-queues")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueuesTableDto>>>> GetMyAgentQueues(
        [FromQuery] DateTimeOffset? from = null,
        [FromQuery] DateTimeOffset? to = null)
    {
        return ResultHelper(await _queueUserService.GetMyAgentQueuesAsync(from, to));
    }

    // Get a list of queue users for a specific Queue
    [HttpGet("{queueId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueueUserDto>>>> GetQueueUsersAsync(Guid queueId)
    {
        return ResultHelper(await _queueUserService.GetQueueUsersAsync(queueId));
    }

    // Get a specific queue user by ID
    [HttpGet("{queueUserId}")]
    public async Task<ActionResult<ServiceResponse<QueueUserDto>>> GetQueueUserAsync(Guid queueUserId)
    {
        return ResultHelper(await _queueUserService.GetQueueUserByIdAsync(queueUserId));
    }

    // Create a new queue user
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<QueueUserDto>>> CreateQueueUserAsync([FromBody] QueueUserDto queueUserDto)
    {
        return ResultHelper(await _queueUserService.InsertQueueUserAsync(queueUserDto));
    }

    // Update an existing queue user
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<QueueUserDto>>> UpdateQueueUserAsync([FromBody] QueueUserDto queueUserDto)
    {
        return ResultHelper(await _queueUserService.UpdateQueueUserAsync(queueUserDto));
    }

    // Delete a queue user by ID
    [HttpDelete("{queueUserId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteQueueUserAsync(Guid queueUserId)
    {
        return ResultHelper(await _queueUserService.DeleteQueueUserAsync(queueUserId));
    }

    // Delete multiple queue users
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteQueueUsersAsync([FromBody] IEnumerable<Guid> queueUserIds)
    {
        return ResultHelper(await _queueUserService.DeleteQueueUsersAsync(queueUserIds));
    }
}
