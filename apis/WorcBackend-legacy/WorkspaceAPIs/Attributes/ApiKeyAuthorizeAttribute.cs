namespace WorkspaceAPIs.Attributes;

[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class ApiKeyAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    private const string ApiKeyHeaderName = "X-API-KEY";

    /// <summary>
    /// Key used to store the validated API key name in <see cref="HttpContext.Items"/> for downstream audit/logging.
    /// </summary>
    public const string ApiKeyNameContextItem = "avplatform:ApiKeyName";

    public ApiKeyAuthorizeAttribute(string permission, bool allowJwtAuth = false)
    {
        Permission = permission;
        AllowJwtAuth = allowJwtAuth;
    }

    public string Permission { get; }

    public bool AllowJwtAuth { get; }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var httpContext = context.HttpContext;
        var cancellationToken = httpContext.RequestAborted;

        // JWT-authenticated requests bypass API key validation when the endpoint supports dual auth.
        if (AllowJwtAuth && httpContext.User.Identity?.IsAuthenticated == true)
        {
            return;
        }

        // Resolve required services from DI.
        var workspaceDbContext = httpContext.RequestServices.GetRequiredService<WorkspaceDbContext>();
        var logger = httpContext.RequestServices.GetRequiredService<ILogger<ApiKeyAuthorizeAttribute>>();

        // Validate API key presence in the request header.
        if (!httpContext.Request.Headers.TryGetValue(ApiKeyHeaderName, out var apiKeyHeader) ||
            string.IsNullOrWhiteSpace(apiKeyHeader))
        {
            SetUnauthorizedResult(context, "API key is missing.");
            return;
        }

        var plainApiKey = apiKeyHeader.ToString();

        // Validate the API key format.
        if (!ApiKeyHelpers.IsValidApiKeyFormat(plainApiKey))
        {
            SetUnauthorizedResult(context, "API key is invalid.");
            return;
        }

        var incomingHash = ApiKeyHelpers.HashApiKey(plainApiKey);

        // Lookup the key in the current tenant scope. WorkspaceDbContext applies the global
        // tenant query filter automatically because TenantResolver has already set the current tenant.
        var apiKeyEntity = await workspaceDbContext.ApiKeys
            .SingleOrDefaultAsync(k => k.KeyHash == incomingHash && !k.IsRevoked
                && (!k.ExpiresAt.HasValue || k.ExpiresAt > DateTimeOffset.UtcNow), cancellationToken);

        if (apiKeyEntity == null)
        {
            SetUnauthorizedResult(context, "API key is invalid.");
            return;
        }

        // Validate requested permission.
        if (!HasPermission(apiKeyEntity.Permissions, Permission))
        {
            SetUnauthorizedResult(context, "API key does not have the required permission.");
            return;
        }

        // Update last used timestamp synchronously (best practice for accurate audit trail).
        try
        {
            apiKeyEntity.LastUsedAt = DateTimeOffset.UtcNow;
            await workspaceDbContext.SaveChangesAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to update LastUsedAt for API key {ApiKeyId}.", apiKeyEntity.Id);
        }

        // Authorization successful; make the API key name available to downstream components for audit.
        httpContext.Items[ApiKeyNameContextItem] = apiKeyEntity.Name;
    }

    private static bool HasPermission(ApiKeyPermissions? permissions, string permission)
    {
        if (permissions == null)
        {
            return false;
        }

        return permission switch
        {
            "machineAuth" => permissions.MachineAuth,
            "webhookTrigger" => permissions.WebhookTrigger,
            "createQueueWorkItem" => permissions.CreateQueueWorkItem,
            "cloudExecution" => permissions.CloudExecution,
            _ => false,
        };
    }

    private static void SetUnauthorizedResult(AuthorizationFilterContext context, string message)
    {
        context.Result = new ContentResult
        {
            StatusCode = 401,
            Content = message,
            ContentType = "text/plain"
        };
    }
}
