namespace WorkspaceAPIs.Controllers;

[Route("api/supportticket-remarks")]
[ApiController]
[Authorize]
public class SupportTicketRemarksController : BaseApiController
{
    private readonly ISupportTicketRemarksService _supportTicketRemarksService;

    public SupportTicketRemarksController(ISupportTicketRemarksService supportTicketRemarksService)
    {
        _supportTicketRemarksService = supportTicketRemarksService;
    }

    // Retrieves all remarks associated with a support ticket.
    [HttpGet("list/{supportTicketId}")]
    public async Task<ActionResult<ServiceResponse<IEnumerable<SupportTicketRemarksDto>>>> GetSupportTicketRemarks(Guid supportTicketId)
    {
        return ResultHelper(await _supportTicketRemarksService.GetSupportTicketRemarksAsync(supportTicketId));
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