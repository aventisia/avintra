namespace MLModelBuilderAPIs.Attributes;

/// <summary>
/// Attribute that validates API key authentication for incoming HTTP requests. Can be applied to controllers or individual actions.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ApiKeyAuthAttribute : Attribute, IAsyncActionFilter
{
    /// <summary>
    /// Intercepts the action execution to validate the provided API key.
    /// </summary>
    /// <param name="context">Context for the executing action.</param>
    /// <param name="next">Delegate to execute the next action/middleware.</param>
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Extract API key from request header
        string? apiKey = GetApiKeyOfRequestUtil.GetApiKeyOfRequest(context.HttpContext);

        // Return 401 Unauthorized if no API key is provided
        if (apiKey == null)
        {
            context.Result = new ContentResult
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Content = "Authentication failed: Missing API Key. Please provide a valid API key in the request header.",
                ContentType = "text/plain"
            };
            return;
        }

        // Get the DbContext from the service provider
        var dbContext = context.HttpContext.RequestServices.GetRequiredService<APIKeyDbContext>();

        // Await the async database query to find the API key record
        var apiKeyRecord = await dbContext.AIProjectVersionAPIKeyReadOnly.Where(k => k.ApiKey == apiKey).SingleOrDefaultAsync();

        // Return 401 Unauthorized if API key is invalid or inactive
        if (apiKeyRecord == null)
        {
            context.Result = new ContentResult
            {
                StatusCode = StatusCodes.Status401Unauthorized,
                Content = "Authentication failed: Invalid or inactive API Key. Please check the provided API key and try again.",
                ContentType = "text/plain"
            };
            return;
        }

        // API key valid — proceed with the request
        await next();
    }
}
