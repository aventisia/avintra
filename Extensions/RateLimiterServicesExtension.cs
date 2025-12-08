namespace AspNetToolkit.Extensions;

public static class RateLimiterServicesExtension
{
    public static void SharedRateLimiter(this IServiceCollection services, IConfiguration config)
    {
        var rateLimiterConfig = config.GetSection("RateLimiterConfig").Get<RateLimiterConfig>() ?? new RateLimiterConfig();

        services.AddRateLimiter(options =>
        {
            options.GlobalLimiter =
                PartitionedRateLimiter.Create<HttpContext, string>(context =>
                {
                    // Client identity
                    var ip = context.Connection.RemoteIpAddress?.ToString();
                    var host = context.Request.Host.Host;
                    var clientId = ip ?? host ?? "unknown-client";

                    // Path, ensuring it is never null
                    var path = context.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;

                    // Endpoint-specific rule
                    var endpoint = rateLimiterConfig.Endpoints.FirstOrDefault(f => path.ToLower().Equals(f.Path.ToLower()));

                    if (endpoint != null)
                    {
                        var key = $"{clientId}:{endpoint.Path}";

                        return RateLimitPartition.GetFixedWindowLimiter(
                            key,
                            _ => new FixedWindowRateLimiterOptions
                            {
                                PermitLimit = endpoint.PermitLimit,
                                Window = TimeSpan.FromMinutes(endpoint.WindowInMinutes),
                                AutoReplenishment = true,
                                QueueLimit = 0
                            });
                    }

                    // Default rule
                    return RateLimitPartition.GetFixedWindowLimiter(
                        $"{clientId}:default",
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = rateLimiterConfig.Default.PermitLimit,
                            Window = TimeSpan.FromMinutes(rateLimiterConfig.Default.WindowInMinutes),
                            AutoReplenishment = true,
                            QueueLimit = rateLimiterConfig.Default.QueueLimit,
                            QueueProcessingOrder = QueueProcessingOrder.OldestFirst
                        });
                });
            options.OnRejected = async (context, token) =>
            {
                context.HttpContext.Response.StatusCode = 429;
                await context.HttpContext.Response.WriteAsync("Too many requests. Please try later again... ", cancellationToken: token);
            };
        });
    }
}