namespace RazorpaySubDemo.Controllers
{
    [ApiController]
    [Route("webhook")]
    public class WebhookController : ControllerBase
    {
        private readonly IWebhookService _webhookService;

        public WebhookController(IWebhookService webhookService)
        {
            _webhookService = webhookService;
        }

        [HttpPost]
        public async Task<IActionResult> ProcessWebhookAsync()
        {
            var isProcessedSuccessfully = await _webhookService.HandleWebhookAsync(Request);

            if (!isProcessedSuccessfully)
            {
                return Unauthorized("The webhook request is invalid or processing failed.");
            }

            return Ok("Webhook processed successfully.");
        }
    }
}
