namespace WorkspaceAPIs.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class WebhookTriggerAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    private const string ApiKeyHeaderName = "x-api-key";

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var httpContext = context.HttpContext;

        // Resolve required services from DI
        var workspaceInternalDbContext = httpContext.RequestServices.GetRequiredService<WorkspaceInternalDbContext>();

        var environmentConfig = httpContext.RequestServices.GetRequiredService<EnvironmentConfig>();

        // Validate API key from request headers
        if (!httpContext.Request.Headers.TryGetValue(ApiKeyHeaderName, out var apiKeyHeader) ||
            string.IsNullOrWhiteSpace(apiKeyHeader))
        {
            context.Result = new ContentResult
            {
                StatusCode = 401,
                Content = "API key is missing."
            };
            return;
        }

        var providedApiKey = apiKeyHeader.ToString();

        // TODO: Move API key retrieval to database (API management entity) instead of environment config after implementation is complete
        var expectedApiKey = "YOUR_API_KEY_HERE";
        if (!string.Equals(providedApiKey, expectedApiKey, StringComparison.Ordinal))
        {
            context.Result = new ContentResult
            {
                StatusCode = 403,
                Content = "API key is invalid."
            };
            return;
        }

        // Read request body (buffering allows downstream access)
        httpContext.Request.EnableBuffering();

        string requestBody;
        using (var reader = new StreamReader(httpContext.Request.Body, leaveOpen: true))
        {
            requestBody = await reader.ReadToEndAsync();
            httpContext.Request.Body.Position = 0;
        }

        // Validate request body presence
        if (string.IsNullOrWhiteSpace(requestBody))
        {
            context.Result = new ContentResult
            {
                StatusCode = 400,
                Content = "Request body cannot be empty."
            };
            return;
        }

        // Extract flowVersionId from JSON payload
        Guid flowVersionId;

        try
        {
            using var json = JsonDocument.Parse(requestBody);

            if (!json.RootElement.TryGetProperty("flowVersionId", out var flowIdProperty) ||
                !Guid.TryParse(flowIdProperty.GetString(), out flowVersionId))
            {
                context.Result = new ContentResult
                {
                    StatusCode = 400,
                    Content = "Invalid or missing 'flowVersionId'."
                };
                return;
            }
        }
        catch
        {
            context.Result = new ContentResult
            {
                StatusCode = 400,
                Content = "Malformed JSON payload."
            };
            return;
        }

        // Retrieve flow version (webhook trigger) from database
        var flowVersion = await workspaceInternalDbContext.FlowVersions
            .SingleOrDefaultAsync(f => f.Id == flowVersionId);

        if (flowVersion == null || !flowVersion.IsPublished)
        {
            // Do not expose whether it exists but is unpublished
            context.Result = new ContentResult
            {
                StatusCode = 404,
                Content = "Webhook endpoint not found."
            };
            return;
        }

        // Authorization successful
    }
}