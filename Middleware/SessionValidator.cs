namespace AspNetToolkit.Middleware;

public class SessionValidator
{
    private readonly RequestDelegate _next;

    public SessionValidator(RequestDelegate next)
    {
        _next = next;
    }

    // Middleware that validates the user's session for authenticated users.
    public async Task Invoke(HttpContext context, ISessionValidationService sessionService)
    {
        // Check if the user is authenticated
        if (context.User.Identity?.IsAuthenticated == true)
        {
            // Try to retrieve the session ID from the user's claims (looking for the "sid" claim)
            var sid = context.User.FindFirst("sid")?.Value;

            // If the session ID is missing, empty, or invalid, respond with 401 Unauthorized
            if (string.IsNullOrEmpty(sid) || !Guid.TryParse(sid, out var sessionId))
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }

            // Validate the session by calling the session validation service
            var isValid = await sessionService.IsSessionValidAsync(sessionId);

            // If the session is invalid, respond with 401 Unauthorized
            if (!isValid)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return;
            }
        }

        // If the user is not authenticated or the session is valid, continue processing the request
        await _next(context);
    }
}
