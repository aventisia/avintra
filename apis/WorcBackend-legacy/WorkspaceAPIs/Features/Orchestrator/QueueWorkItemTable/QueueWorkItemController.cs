namespace WorkspaceAPIs.Controllers;

[Route("queue/workitem")]
[ApiController]
[Authorize]
public class QueueWorkItemController : BaseApiController
{
    private readonly IQueueWorkItemService _queueWorkItemService;

    public QueueWorkItemController(IQueueWorkItemService queueWorkItemService)
    {
        _queueWorkItemService = queueWorkItemService;
    }

    // Retrieve all work items associated with a specific queue
    [HttpGet("{queueId}/list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueueWorkItemDto>>>> GetWorkItems(Guid queueId)
    {
        // Fetch all work items for the given queue
        return ResultHelper(await _queueWorkItemService.GetAllWorkItemsAsync(queueId));
    }

    // Retrieves work items for the specified queue based on filter criteria
    [HttpPost("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueueWorkItemDto>>>> GetQueueWorkItemItems(QueueFilterRequestDto queueFilterRequestDto)
    {
        return ResultHelper(await _queueWorkItemService.GetQueueWorkItemsAsync(queueFilterRequestDto));
    }

    // Retrieves a specific queue work item by its ID.
    [HttpGet("{queueWorkItemId}")]
    public async Task<ActionResult<ServiceResponse<QueuesTableDto>>> GetQueueWorkItemById(Guid queueWorkItemId)
    {
        return ResultHelper(await _queueWorkItemService.GetQueueWorkItemByIdAsync(queueWorkItemId));
    }

    // Add single/multiple work items to the specified queue
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<QueueWorkItemDto>>> InsertMultipleWorkItemsAsync([FromBody] QueueWorkItemDto queueWorkItemDto)
    {
        return ResultHelper(await _queueWorkItemService.InsertWorkItemsAsync(queueWorkItemDto));
    }

    // Add multiple work items to the specified queue
    [AllowAnonymous, CustomAuthorize]
    [HttpPost("data-items")]
    public async Task<ActionResult<ServiceResponse<QueueWorkItemDto>>> AddWorkItemAsync([FromBody] QueueWorkItemDto queueWorkItemDto)
    {
        return ResultHelper(await _queueWorkItemService.InsertWorkItemsAsync(queueWorkItemDto));
    }

    // Modify the status of an existing work item (e.g., Pending → In Progress → Completed/Failed)
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<QueueWorkItemDto>>> UpdateWorkItem([FromBody] QueueWorkItemDto queueWorkItemDto)
    {
        return ResultHelper(await _queueWorkItemService.UpdateWorkItemAsync(queueWorkItemDto));
    }

    // Move an existing workitem from its current queue to a destination queue
    [HttpPut("move")]
    public async Task<ActionResult<ServiceResponse<bool>>> MoveWorkItem([FromBody] MoveQueueWorkItemRequestDto moveQueueWorkItemRequestDto)
    {
        return ResultHelper(await _queueWorkItemService.MoveWorkItemAsync(moveQueueWorkItemRequestDto));
    }

    // Remove a specific work item from the queue
    [HttpDelete("{workItemId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteWorkItem(Guid workItemId)
    {
        return ResultHelper(await _queueWorkItemService.RemoveWorkItemAsync(workItemId));
    }

    // Deletes multiple queue work items by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteQueueWorkItems([FromBody] List<Guid> queueWorkItemIds)
    {
        return ResultHelper(await _queueWorkItemService.DeleteQueueWorkItemsAsync(queueWorkItemIds));
    }
}