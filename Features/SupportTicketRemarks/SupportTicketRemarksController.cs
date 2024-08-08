namespace WorkspaceAPIs.Controllers;

[Route("supportticket-remarks")]
[ApiController]
[Authorize]
public class SupportTicketRemarksController : BaseApiController
{
    private readonly ISupportTicketRemarksService _supportTicketRemarksService;

    public SupportTicketRemarksController(ISupportTicketRemarksService supportTicketRemarksService)
    {
        _supportTicketRemarksService = supportTicketRemarksService;
    }

    // Gets list of remarks of single support ticket using ticket Id.
    [HttpGet("list/{ticketId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SupportTicketRemarksDto>>>> GetSupportTicketRemarks(Guid ticketId)
    {
        return ResultHelper(await _supportTicketRemarksService.GetSupportTicketRemarksAsync(ticketId));
    }

    // Create a new support ticket remark.
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<SupportTicketRemarksDto>>> InsertSupportTicketRemark([FromBody] SupportTicketRemarksDto supportTicketRemarksDto)
    {
        return ResultHelper(await _supportTicketRemarksService.InsertSupportTicketRemarkAsync(supportTicketRemarksDto));
    }

    // Update the support ticket remark with IsEdited flag
    [HttpPut]
    public async Task<ActionResult<ServiceResponse<SupportTicketRemarksDto>>> UpdateSupportTicketRemark([FromBody] SupportTicketRemarksDto supportTicketRemarksDto)
    {
        return ResultHelper(await _supportTicketRemarksService.UpdateSupportTicketRemarkAsync(supportTicketRemarksDto));
    }

    // Deletes support ticket remark permanently.
    [HttpDelete("{id}")]
    public async Task<ActionResult<ServiceResponse<bool>>> DeleteSupportTicketRemark(Guid id)
    {
        return ResultHelper(await _supportTicketRemarksService.DeleteSupportTicketRemarkAsync(id));
    }

}