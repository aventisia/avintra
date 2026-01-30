namespace WorkspaceAPIs.Controllers;

[Authorize]
[ApiController]
[Route("queue-agent")]
public class QueueFlowVersionController : BaseApiController
{
    private readonly IQueueFlowVersionService _queueFlowVersionService;

    public QueueFlowVersionController(IQueueFlowVersionService queueFlowVersionService)
    {
        _queueFlowVersionService = queueFlowVersionService;
    }

    // Get a list of queue flow versions for a specific Queue
    [HttpGet("{queueId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueueFlowVersionDto>>>> GetQueueFlowVersionsAsync(Guid queueId)
    {
        return ResultHelper(await _queueFlowVersionService.GetQueueFlowVersionsAsync(queueId));
    }

    // Get a specific queue flow version by ID
    [HttpGet("{queueFlowVersionId}")]
    public async Task<ActionResult<ServiceResponse<QueueFlowVersionDto>>> GetQueueFlowVersionAsync(Guid queueFlowVersionId)
    {
        return ResultHelper(await _queueFlowVersionService.GetQueueFlowVersionByIdAsync(queueFlowVersionId));
    }

    // Create a new queue flow version
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<QueueFlowVersionDto>>> CreateQueueFlowVersionAsync([FromBody] QueueFlowVersionDto queueFlowVersionDto)
    {
        return ResultHelper(await _queueFlowVersionService.InsertQueueFlowVersionAsync(queueFlowVersionDto));
    }

    // Update an existing queue flow version
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<QueueFlowVersionDto>>> UpdateQueueFlowVersionAsync([FromBody] QueueFlowVersionDto queueFlowVersionDto)
    {
        return ResultHelper(await _queueFlowVersionService.UpdateQueueFlowVersionAsync(queueFlowVersionDto));
    }

    // Delete a queue flow version by ID
    [HttpDelete("{queueFlowVersionId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteQueueFlowVersionAsync(Guid queueFlowVersionId)
    {
        return ResultHelper(await _queueFlowVersionService.DeleteQueueFlowVersionAsync(queueFlowVersionId));
    }

    // Delete multiple queue flow versions
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteQueueFlowVersionsAsync([FromBody] IEnumerable<Guid> queueFlowVersionIds)
    {
        return ResultHelper(await _queueFlowVersionService.DeleteQueueFlowVersionsAsync(queueFlowVersionIds));
    }
}