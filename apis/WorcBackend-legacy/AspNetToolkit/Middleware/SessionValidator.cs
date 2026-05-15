namespace AspNetToolkit.Middleware;

public class SessionValidator
{
    private readonly RequestDelegate _next;

    public SessionValidator(RequestDelegate next)
    {
        _next = next;
    }

    // Middleware that validates the user's session for authenticated users.
    public async Task Invoke(HttpContext context, ISessionValidationService sessionService, AppDefaultConfig appDefaultConfig)
    {
        // Try to retrieve the session ID from the user's claims (looking for the "sid" claim)
        var sid = context.User.FindFirst("sid")?.Value;

        // Construct a string representing the current endpoint in the format "method:path", e.g., "get:/api/users"
        var currentEndpoint = (context.Request.Method + ":" + context.Request.Path).ToLower();

        // Determine if the current endpoint is tenantless (does not require a tenant/session check)
        // Tenantless endpoints are defined in the configuration and can include wildcards (*)
        bool isTenantless = appDefaultConfig.TenantlessEndpoints != null &&
                            appDefaultConfig.TenantlessEndpoints.Any(pattern =>
                            {
                                // Convert wildcard pattern to a regex pattern for matching
                                var regexPattern = "^" + Regex.Escape(pattern).Replace("\\*", ".*") + "$";
                                return Regex.IsMatch(currentEndpoint, regexPattern);
                            });

        // If the endpoint is not tenantless AND the user is authenticated AND a session ID exists then we need to validate the session
        if (!isTenantless && context.User.Identity?.IsAuthenticated == true && !string.IsNullOrEmpty(sid))
        {
            // Parse the sid
            Guid.TryParse(sid, out var sessionId);

            // If the session ID is invalid, respond with 401 Unauthorized
            if (sessionId.Equals(Guid.Empty))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "text/plain";
                await context.Response.WriteAsync("Invalid session");
                return;
            }

            // Validate the session by calling the session validation service
            var isValid = await sessionService.IsSessionValidAsync(sessionId);

            // If the session is invalid, respond with 401 Unauthorized
            if (!isValid)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                context.Response.ContentType = "text/plain";
                await context.Response.WriteAsync("Session expired");
                return;
            }
        }

        // If the user is not authenticated or the session is valid, continue processing the request
        await _next(context);
    }
}
