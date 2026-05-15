namespace AspNetToolkit.Extensions;

public static class RateLimiterServicesExtension
{
    public static void SharedRateLimiter(this IServiceCollection services, IConfiguration config)
    {
        // Load rate limiter configuration from appsettings.json (supports both root and AppDefaultConfig nesting)
        var rateLimiterConfig = config.GetSection("AppDefaultConfig:RateLimiterConfig").Get<RateLimiterConfig>() ?? new RateLimiterConfig();

        // Register the global rate limiter
        services.AddRateLimiter(options =>
        {
            // Partitioned rate limiter allows creating a limiter per client (IP/user/endpoint)
            options.GlobalLimiter =
                PartitionedRateLimiter.Create<HttpContext, string>(context =>
                {
                    // Get client IP address
                    var ip = context.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                                ?? context.Connection.RemoteIpAddress?.ToString();

                    // Get user ID if the user is authenticated
                    var userId = context.User?.Identity?.IsAuthenticated == true
                        ? context.User?.FindFirstValue("uid")
                        : string.Empty;

                    // Get host as a fallback if IP is not available
                    var host = context?.Request.Host.Host;

                    // Construct the client identifier:
                    // - Authenticated users: combine IP + userId
                    // - Unauthenticated users: use IP or host
                    var clientId = !string.IsNullOrEmpty(userId)
                        ? $"{ip ?? host}:{userId}"
                        : $"{ip ?? host ?? "unknown-client"}";

                    // Get request path (ensure lowercase for consistent matching)
                    var path = context?.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;

                    // Find endpoint-specific rate limiting configuration
                    var endpoint = rateLimiterConfig.Endpoints
                        .FirstOrDefault(f => path.Equals(f.Path, StringComparison.OrdinalIgnoreCase));

                    // Construct the rate limiter key
                    // - If endpoint config exists: use clientId + endpoint path
                    // - Otherwise: use clientId + "default"
                    var rateLimitKey = endpoint != null ? $"{clientId}:{endpoint.Path}" : $"{clientId}:default";

                    // If there is an endpoint-specific configuration, use its rules
                    if (endpoint != null)
                    {
                        return RateLimitPartition.GetFixedWindowLimiter(
                            rateLimitKey,
                            _ => new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = endpoint.PermitLimit,
                                Window = TimeSpan.FromMinutes(endpoint.WindowInMinutes),
                                AutoReplenishment = true,
                                QueueLimit = 0
                            });
                    }

                    // Default rate limiting configuration
                    return RateLimitPartition.GetFixedWindowLimiter(
                        rateLimitKey,
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = rateLimiterConfig.Default.PermitLimit,
                            Window = TimeSpan.FromMinutes(rateLimiterConfig.Default.WindowInMinutes),
                            AutoReplenishment = true,
                            QueueLimit = rateLimiterConfig.Default.QueueLimit,
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst
                        });
                });

            // Action to perform when a request is rejected due to rate limiting
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = 429; // HTTP 429 Too Many Requests
                context.HttpContext.Response.ContentType = "text/plain";
                await context.HttpContext.Response.WriteAsync(
                    "Too many requests. Please try later.",
                    cancellationToken: token
                );
            };
        });
    }
}