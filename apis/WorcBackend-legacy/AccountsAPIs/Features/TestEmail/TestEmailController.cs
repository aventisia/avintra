namespace AccountsAPIs.Controllers;

[ApiController]
[Route("test-email")]
[Authorize(Roles = "SA")]
public class EmailController : BaseApiController
{
    private readonly IEmailService _emailService;

    public EmailController(IEmailService emailService)
    {
        _emailService = emailService;
    }

    // Send test email using a template
    [HttpPost("template")]
    public async Task<IActionResult> TestEmailTemplate([FromBody] TestEmailTemplateRequestDto requestDto)
    {
        return ResultHelper(await _emailService.TestEmailTemplateAsync(
            emailAddresses: requestDto.EmailAddresses,
            templateName: requestDto.TemplateName,
            ccEmailAddresses: requestDto.CcEmailAddresses,
            bccEmailAddresses: requestDto.BccEmailAddresses)
        );
    }
}