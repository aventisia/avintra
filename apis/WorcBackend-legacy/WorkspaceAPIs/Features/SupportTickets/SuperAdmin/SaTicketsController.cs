namespace WorkspaceAPIs.Controllers;

[Route("sa/support-tickets")]
[ApiController]
[Authorize(Roles = "SA")]
public class SaTicketsController : BaseApiController
{
    private readonly ISuperAdminTicketService _superAdminTicketService;

    public SaTicketsController(ISuperAdminTicketService superAdminTicketService)
    {
        _superAdminTicketService = superAdminTicketService;
    }

    // Retrieves a ticket by its ID.
    [HttpGet("{ticketId}")]
    public async Task<ActionResult<ServiceResponse<TicketDto>>> GetTicket(Guid ticketId)
    {
        return ResultHelper(await _superAdminTicketService.GetTicketAsync(ticketId));
    }

    // Retrieves list of tickets.
    [HttpGet("list")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TicketTableDto>>>> GetTickets()
    {
        return ResultHelper(await _superAdminTicketService.GetTicketsAsync());
    }

    // Insert a new ticket.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<TicketDto>>> CreateTicket([FromBody] TicketTableDto ticketDto)
    {
        return ResultHelper(await _superAdminTicketService.CreateTicketAsync(ticketDto));
    }

    // Updates an existing ticket.
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<TicketDto>>> UpdateTicket([FromBody] TicketTableDto ticketDto)
    {
        return ResultHelper(await _superAdminTicketService.UpdateTicketAsync(ticketDto));
    }

    // Deletes an existing ticket.
    [HttpDelete("{ticketId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteTicket(Guid ticketId)
    {
        return ResultHelper(await _superAdminTicketService.DeleteTicketAsync(ticketId));
    }

    // Deletes multiple tickets by their IDs.
    [HttpPost("delete-multiple")]
    public async Task<ActionResult<ServiceResponse<int>>> DeleteMultipleTickets([FromBody] IEnumerable<Guid> ticketIds)
    {
        return ResultHelper(await _superAdminTicketService.DeleteMultipleTicketsAsync(ticketIds));
    }

    // Updates the status of an existing ticket.
    [HttpPut("status")]
    public async Task<ActionResult<ServiceResponse<TicketDto>>> UpdateTicketStatus([FromBody] TicketStatusUpdateDto statusUpdateDto)
    {
        return ResultHelper(await _superAdminTicketService.UpdateTicketStatusAsync(statusUpdateDto));
    }

    // Updates the triage information of an existing ticket.
    [HttpPut("triage")]
    public async Task<ActionResult<ServiceResponse<TicketDto>>> UpdateTicketTriage([FromBody] TicketTriageUpdateDto triageUpdateDto)
    {
        return ResultHelper(await _superAdminTicketService.UpdateTicketTriageAsync(triageUpdateDto));
    }

    // Retrieves list of comments for a ticket.
    [HttpGet("{ticketId}/comments")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TicketCommentDto>>>> GetComments(Guid ticketId)
    {
        return ResultHelper(await _superAdminTicketService.GetCommentsAsync(ticketId));
    }

    // Inserts a new comment on a ticket.
    [HttpPost("{ticketId}/comments")]
    public async Task<ActionResult<ServiceResponse<TicketCommentDto>>> CreateComment(Guid ticketId, [FromBody] TicketCommentDto commentDto)
    {
        commentDto.TicketId = ticketId;
        return ResultHelper(await _superAdminTicketService.CreateCommentAsync(commentDto));
    }

    // Updates an existing comment on a ticket.
    [HttpPut("{ticketId}/comments/{commentId}")]
    public async Task<ActionResult<ServiceResponse<TicketCommentDto>>> UpdateComment(Guid ticketId, Guid commentId, [FromBody] TicketCommentDto commentDto)
    {
        commentDto.Id = commentId;
        return ResultHelper(await _superAdminTicketService.UpdateCommentAsync(commentDto));
    }

    // Deletes an existing comment on a ticket.
    [HttpDelete("{ticketId}/comments/{commentId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteComment(Guid ticketId, Guid commentId)
    {
        return ResultHelper(await _superAdminTicketService.DeleteCommentAsync(commentId));
    }

    // Retrieves list of attachments for a ticket.
    [HttpGet("{ticketId}/attachments")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TicketAttachmentDto>>>> GetAttachments(Guid ticketId)
    {
        return ResultHelper(await _superAdminTicketService.GetAttachmentsAsync(ticketId));
    }

    // Inserts a new attachment on a ticket.
    [HttpPost("{ticketId}/attachments")]
    public async Task<ActionResult<ServiceResponse<TicketAttachmentDto>>> CreateAttachment(Guid ticketId, [FromBody] TicketAttachmentDto attachmentDto)
    {
        attachmentDto.TicketId = ticketId;
        return ResultHelper(await _superAdminTicketService.CreateAttachmentAsync(attachmentDto));
    }

    // Deletes an existing attachment on a ticket.
    [HttpDelete("{ticketId}/attachments/{attachmentId}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteAttachment(Guid ticketId, Guid attachmentId)
    {
        return ResultHelper(await _superAdminTicketService.DeleteAttachmentAsync(attachmentId));
    }

    // Retrieves the history of a ticket.
    [HttpGet("{ticketId}/history")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<TicketHistoryDto>>>> GetHistory(Guid ticketId)
    {
        return ResultHelper(await _superAdminTicketService.GetHistoryAsync(ticketId));
    }
}
