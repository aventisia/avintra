namespace AccountsAPIs.Services;

public interface IWebhookService
{
    /// <summary>
    /// Verifies and processes an incoming Razorpay webhook request.
    /// </summary>
    /// <param name="request">The raw HTTP request sent by Razorpay.</param>
    /// <returns>Returns <c>true</c> if the webhook is verified and processed successfully; otherwise, <c>false</c>.</returns>
    Task<bool> HandleWebhookAsync(HttpRequest request);
}