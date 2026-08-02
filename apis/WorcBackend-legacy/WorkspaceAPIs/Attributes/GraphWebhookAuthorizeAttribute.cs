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

        // Extract clientState token from Graph payload
        string? clientState;
        try
        {
            using var json = JsonDocument.Parse(body);
            clientState = json.RootElement
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

        // Ensure clientState token exists
        if (string.IsNullOrEmpty(clientState))
        {
            context.Result = new ContentResult
            {
                StatusCode = 401,
                Content = "Missing clientState"
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

        // Get stored clientState from metadata JSON
        string? storedClientState = null;
        if (trigger.Metadata.RootElement.TryGetProperty("clientState", out var clientStateProperty))
        {
            storedClientState = clientStateProperty.GetString();
        }

        // Compare incoming clientState with stored value
        if (!string.Equals(storedClientState, clientState, StringComparison.Ordinal))
        {
            context.Result = new ContentResult
            {
                StatusCode = 403,
                Content = "Invalid clientState"
            };
            return;
        }

        // If we reach here → request is valid
    }
}