namespace WorkspaceAPIs.Controllers;

[Route("supportticket")]
[ApiController]
[Authorize]
public class SupportTicketsTableController : BaseApiController
{
    private readonly ISupportTicketsTableService _supportTicketsTableService;

    public SupportTicketsTableController(ISupportTicketsTableService supportTicketsTableService)
    {
        _supportTicketsTableService = supportTicketsTableService;
    }

    // Retrieves a support ticket by its ID/ticketNumber.
    [HttpGet("{id}")]
    public async Task<ActionResult<ServiceResponse<SupportTicketsTableDto>>> GetSupportTicket(string id)
    {
        return ResultHelper(await _supportTicketsTableService.GetSupportTicketAsync(id));
    }

    // Retrieves list of support tickets.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SupportTicketsTableDto>>>> GetSupportTickets()
    {
        return ResultHelper(await _supportTicketsTableService.GetSupportTicketsAsync());
    }

    // Inserts a new support ticket.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<SupportTicketsTableDto>>> InsertSupportTicket([FromBody] SupportTicketsTableDto supportTicketDto)
    {
        return ResultHelper(await _supportTicketsTableService.InsertSupportTicketAsync(supportTicketDto));
    }

    // Updates an existing support ticket.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<SupportTicketsTableDto>>> UpdateSupportTicket([FromBody] SupportTicketsTableDto supportTicketDto)
    {
        return ResultHelper(await _supportTicketsTableService.UpdateSupportTicketAsync(supportTicketDto));
    }

    // Deletes a support ticket from the database permanently, if allowed and if deleting relationship records is possible or allowed.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSupportTicket(Guid id)
    {
        return ResultHelper(await _supportTicketsTableService.DeleteSupportTicketAsync(id));
    }
}