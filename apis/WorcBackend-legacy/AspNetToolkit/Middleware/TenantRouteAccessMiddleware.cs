namespace AspNetToolkit.Middleware;

public class TenantRouteAccessMiddleware
{
    private readonly RequestDelegate _next;
    public TenantRouteAccessMiddleware(
        RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, EnvironmentConfig environmentConfig)
    {
        // Attempt to parse tenant type from configuration
        if (!Enum.TryParse<OnPremTenantTypesEnum>(environmentConfig.OnPremTenantType, ignoreCase: true, out var tenantType))
        {
            // If parsing fails, return 403 Forbidden immediately
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "text/plain";
            await context.Response.WriteAsync($"Invalid or missing tenant type - {environmentConfig.OnPremTenantType}");
            return;
        }

        var path = context.Request.Path.Value;

        if (string.IsNullOrEmpty(path))
        {
            // If path is empty or null, skip the middleware processing
            await _next(context);
            return;
        }

        // Check if the path is restricted for the current tenant type
        if (TenantAccessRestrictions.RestrictedRoutes
            .TryGetValue(tenantType, out var restrictedRoutes) &&
            restrictedRoutes.Contains(path))
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "text/plain";
            // Updated message: "Invalid endpoint" to indicate the path is not allowed for the tenant
            await context.Response.WriteAsync("Invalid endpoint for the current tenant.");
            return;
        }

        // Proceed to the next middleware if no restriction applies
        await _next(context);
    }
}