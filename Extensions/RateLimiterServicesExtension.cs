namespace AspNetToolkit.Extensions;

public static class RateLimiterServicesExtension
{
    public static void SharedRateLimiter(this IServiceCollection services, IConfiguration config)
    {
        // we will be configuring it later
        var rateLimiterConfig = config.GetSection("RateLimiterConfig");

        services.AddRateLimiter(options =>
        {
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                return RateLimitPartition.GetFixedWindowLimiter(partitionKey: httpContext.Request.Headers.Host.ToString(), partition =>
                    new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 5,
                        AutoReplenishment = true,
                        QueueLimit = 5,
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        Window = TimeSpan.FromSeconds(10)
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