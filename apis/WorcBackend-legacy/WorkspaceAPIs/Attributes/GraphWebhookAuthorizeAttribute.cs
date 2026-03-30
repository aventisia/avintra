namespace WorkspaceAPIs.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class GraphWebhookAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var httpContext = context.HttpContext;

        // Handle Microsoft Graph validation request (validationToken in query string)
        if (httpContext.Request.Query.ContainsKey("validationToken"))
        {
            var token = httpContext.Request.Query["validationToken"].ToString();

            // Must return token as plain text
            context.Result = new ContentResult
            {
                StatusCode = 200,
                Content = token,
                ContentType = "text/plain"
            };
            return;
        }

        // Resolve DB context
        var dbContext = httpContext.RequestServices.GetRequiredService<WorkspaceInternalDbContext>();

        // Get triggerId from route (/notify/{triggerId})
        if (!httpContext.Request.RouteValues.TryGetValue("triggerId", out var triggerIdObj)
            || !Guid.TryParse(triggerIdObj?.ToString(), out Guid triggerId))
        {
            context.Result = new ContentResult
            {
                StatusCode = 400,
                Content = "Invalid triggerId"
            };
            return;
        }

        // Read request body (needed to extract clientState)
        httpContext.Request.EnableBuffering();

        string body;
        using (var reader = new StreamReader(httpContext.Request.Body, leaveOpen: true))
        {
            body = await reader.ReadToEndAsync();

            // Reset stream so controller can read it again
            httpContext.Request.Body.Position = 0;
        }

        // Extract clientState (API key) from Graph payload
        string? apiKey;
        try
        {
            using var json = JsonDocument.Parse(body);
            apiKey = json.RootElement
                         .GetProperty("value")[0]
                         .GetProperty("clientState")
                         .GetString();
        }
        catch
        {
            context.Result = new ContentResult
            {
                StatusCode = 400,
                Content = "Invalid payload"
            };
            return;
        }

        // Ensure API key exists
        if (string.IsNullOrEmpty(apiKey))
        {
            context.Result = new ContentResult
            {
                StatusCode = 401,
                Content = "Missing API key"
            };
            return;
        }

        // Fetch trigger from DB
        var trigger = await dbContext.Triggers.SingleOrDefaultAsync(w => w.Id == triggerId);
        if (trigger == null)
        {
            context.Result = new ContentResult
            {
                StatusCode = 404,
                Content = "Trigger not found"
            };
            return;
        }

        // Get stored API key from metadata JSON
        var triggerApiKey = trigger.Metadata.RootElement
            .GetProperty("apiKey")
            .GetString();

        // Compare incoming API key with stored value
        if (!string.Equals(triggerApiKey, apiKey))
        {
            context.Result = new ContentResult
            {
                StatusCode = 403,
                Content = "Invalid API Key"
            };
            return;
        }

        // If we reach here → request is valid
    }
}