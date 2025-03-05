namespace WorkspaceAPIs.Controllers;

[Route("queue-transaction")]
[ApiController]
[Authorize]
public class QueueTransactionController : BaseApiController
{
    private readonly IQueueTransactionService _queueTransactionService;

    public QueueTransactionController(IQueueTransactionService queueTransactionService)
    {
        _queueTransactionService = queueTransactionService;
    }

    // Retrieve all transactions associated with a specific queue
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<QueueTransactionDto>>>> GetTransactions(Guid? queueId)
    {
        // Fetch all transactions for the given queue
        return ResultHelper(await _queueTransactionService.GetAllTransactionsAsync(queueId));
    }

    // Add a new transaction (work item) to the specified queue
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<QueueTransactionDto>>> InsertTransactionAsync([FromBody] QueueTransactionDto queueTransactionDto)
    {
        return ResultHelper(await _queueTransactionService.InsertTransactionAsync(queueTransactionDto));
    }

    // Modify the status of an existing transaction (e.g., Pending → In Progress → Completed/Failed)
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<QueueTransactionDto>>> UpdateTransactionStatus([FromBody] QueueTransactionDto queueTransactionDto)
    {
        return ResultHelper(await _queueTransactionService.UpdateTransactionStatusAsync(queueTransactionDto));
    }

    // Remove a specific transaction (work item) from the queue
    [HttpDelete("{transactionId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTransaction(Guid transactionId)
    {
        return ResultHelper(await _queueTransactionService.RemoveTransactionAsync(transactionId));
    }
}
