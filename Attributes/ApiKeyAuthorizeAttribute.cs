namespace MLModelBuilderAPIs.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ApiKeyAuthAttribute : Attribute, IAsyncActionFilter
{
    // Constant for the header name that holds the API key
    private const string API_KEY_HEADER_NAME = "X-API-KEY";

    public async Task OnActionExecutionAsync(ActionExecutingContext actionExecutingContext, ActionExecutionDelegate next)
    {
        // Get the DbContext from the request's service provider
        var dbContext = actionExecutingContext.HttpContext.RequestServices.GetRequiredService<MLModelBuilderDbContext>();

        // Try to retrieve the API key from the request's headers
        if (!actionExecutingContext.HttpContext.Request.Headers.TryGetValue(API_KEY_HEADER_NAME, out var apiKeyFromHeader))
        {
            // If no API key is provided, set the result to Unauthorized with a message
            actionExecutingContext.Result = new UnauthorizedObjectResult("Authentication failed: Missing API Key. Please provide a valid API key in the request header.");
            return;
        }

        // Normalize API key for case-insensitive comparison
        var normalizedApiKey = apiKeyFromHeader.ToString().ToLower();

        // Check if the provided API key exists in the database (case-insensitive)
        var apiKeyRecord = await dbContext.ModelAPIKeys
            .FirstOrDefaultAsync(record => record.ApiKey.ToLower() == normalizedApiKey);

        // If no matching API key is found, set the result to Unauthorized with a different message
        if (apiKeyRecord == null)
        {
            actionExecutingContext.Result = new UnauthorizedObjectResult("Authentication failed: Invalid or inactive API Key. Please check the provided API key and try again.");
            return;
        }

        // If the API key is valid, continue the execution of the action
        await next();
    }
}