namespace AccountsAPIs.Controllers;

[Route("email-campaign")]
[ApiController]
public class EmailCampaignController : BaseApiController
{
    private readonly IEmailCampaignService _emailCampaignService;

    public EmailCampaignController(IEmailCampaignService emailCampaignService)
    {
        _emailCampaignService = emailCampaignService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<ServiceResponse<IEnumerable<EmailCampaignDto>>>> GetEmailCampaignRecords(
        [FromQuery] DateTimeOffset? startDate,
        [FromQuery] DateTimeOffset? endDate,
        [FromQuery] string? campaignID)
    {
        return ResultHelper(await _emailCampaignService.GetEmailCampaignsAsync(startDate, endDate, campaignID));
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<bool>>> InsertEmailCampaign([FromBody] EmailCampaignDto emailCampaignDto)
    {
        return ResultHelper(await _emailCampaignService.InsertEmailCampaignAsync(emailCampaignDto));
    }
}
