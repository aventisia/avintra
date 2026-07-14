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
    [HttpPost]
    public async Task<ActionResult<ServiceResponse<bool>>> InsertEmailCampaign([FromBody] EmailCampaignDto emailCampaignDto)
    {
        return ResultHelper(await _emailCampaignService.InsertEmailCampaignAsync(emailCampaignDto));
    }
}
