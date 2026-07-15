namespace WorkspaceAPIs.Controllers;

[Route("queue/transaction-events")]
[ApiController]
[Authorize]
public class QueueTransactionEventController : BaseApiController
{
    private readonly IQueueTransactionEventService _queueTransactionEventService;

    public QueueTransactionEventController(IQueueTransactionEventService queueTransactionEventService)
    {
        _queueTransactionEventService = queueTransactionEventService;
    }

    // Retrieves all events associated with a specific queue transaction.
    [HttpGet("{queueTransactionId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueueTransactionEventDto>>>> GetQueueTransactionEvents(Guid queueTransactionId)
    {
        return ResultHelper(await _queueTransactionEventService.GetQueueTransactionEventsAsync(queueTransactionId));
    }

    // Retrieves a specific queue transaction event by its unique identifier.
    [HttpGet("{queueTransactionEventId}")]
    public async Task<ActionResult<ServiceResponse<QueueTransactionEventDto>>> GetQueueTransactionEventById(Guid queueTransactionEventId)
    {
        return ResultHelper(await _queueTransactionEventService.GetQueueTransactionEventByIdAsync(queueTransactionEventId));
    }

    // Creates a new event for a queue transaction.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<QueueTransactionEventDto>>> CreateQueueTransactionEvent([FromBody] QueueTransactionEventDto queueTransactionEventDto)
    {
        return ResultHelper(await _queueTransactionEventService.CreateQueueTransactionEventAsync(queueTransactionEventDto));
    }

    // Updates an existing queue transaction event.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<QueueTransactionEventDto>>> UpdateQueueTransactionEvent(
        [FromBody] QueueTransactionEventDto queueTransactionEventDto)
    {
        return ResultHelper(await _queueTransactionEventService.UpdateQueueTransactionEventAsync(queueTransactionEventDto));
    }

    // Deletes a queue transaction event.
    [HttpDelete("{queueTransactionEventId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteQueueTransactionEvent(Guid queueTransactionEventId)
    {
        return ResultHelper(await _queueTransactionEventService.DeleteQueueTransactionEventAsync(queueTransactionEventId));
    }

    // Deletes multiple queue transaction events.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteQueueTransactionEvents([FromBody] List<Guid> queueTransactionEventIds)
    {
        return ResultHelper(await _queueTransactionEventService.DeleteQueueTransactionEventsAsync(queueTransactionEventIds));
    }
}