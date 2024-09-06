namespace WorkspaceAPIs.Controllers;

[Route("supportticket-reviewer")]
[ApiController]
[Authorize]
public class SupportTicketReviewerController : BaseApiController
{
    private readonly ISupportTicketReviewerService _supportTicketReviewerService;

    public SupportTicketReviewerController(ISupportTicketReviewerService supportTicketReviewerService)
    {
        _supportTicketReviewerService = supportTicketReviewerService;
    }

    // Retrieves a support ticket associated with reviewer by ticketId/ticketNumber.
    [HttpGet("{ticketId}")]
    public async Task<ActionResult<ServiceResponse<SupportTicketsTableDto>>> GetSupportTicket(string ticketId)
    {
        return ResultHelper(await _supportTicketReviewerService.GetSupportTicketAsync(ticketId));
    }

    // Retrieves all support tickets associated with a reviewer.
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SupportTicketsTableDto>>>> GetSupportTickets()
    {
        return ResultHelper(await _supportTicketReviewerService.GetSupportTicketsAsync());
    }

    // Inserts a new support ticket.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<SupportTicketsTableDto>>> InsertSupportTicket([FromBody] SupportTicketsTableDto supportTicketDto)
    {
        return ResultHelper(await _supportTicketReviewerService.InsertSupportTicketAsync(supportTicketDto));
    }

    // Updates an existing support ticket.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<SupportTicketsTableDto>>> UpdateSupportTicket([FromBody] STUpdateByReviewerDto stUpdateByReviewerDto)
    {
        return ResultHelper(await _supportTicketReviewerService.UpdateSupportTicketAsync(stUpdateByReviewerDto));
    }

    // Inserts a new remark to the existing support ticket
    [HttpPost("remarks")]
    public async Task<ActionResult<ServiceResponse<SupportTicketRemarksDto>>> InsertSupportTicketRemark([FromBody] SupportTicketRemarksDto supportTicketRemarksDto)
    {
        return ResultHelper(await _supportTicketReviewerService.InsertSupportTicketRemarkAsync(supportTicketRemarksDto));
    }

    // Updates an existing support ticket remark
    [HttpPut("remarks")]
    public async Task<ActionResult<ServiceResponse<SupportTicketRemarksDto>>> UpdateSupportTicketRemark([FromBody] SupportTicketRemarksDto supportTicketRemarksDto)
    {
        return ResultHelper(await _supportTicketReviewerService.UpdateSupportTicketRemarkAsync(supportTicketRemarksDto));
    }

    // Deletes a support ticket remark
    [HttpDelete("remarks/{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSupportTicketRemark(Guid id)
    {
        return ResultHelper(await _supportTicketReviewerService.DeleteSupportTicketRemarkAsync(id));
    }
}
