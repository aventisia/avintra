namespace AspNetToolkit.Extensions;

public static class RateLimiterServicesExtension
{
    /// <summary>
    /// Binds RateLimiterConfig from configuration (appsettings.json, RateLimiterConfig section) and
    /// registers it as a singleton consumed by <see cref="AspNetToolkit.Middleware.MethodRateLimitMiddleware"/>.
    /// All thresholds come from configuration; nothing is hardcoded here.
    /// </summary>
    public static void SharedRateLimiter(this IServiceCollection services, IConfiguration config)
    {
        var rateLimiterConfig = config.GetSection("AppDefaultConfig:RateLimiterConfig").Get<RateLimiterConfig>()
                                ?? new RateLimiterConfig();

        services.AddSingleton(rateLimiterConfig);
    }

    /// <summary>
    /// Adds the method-specific rate limiting middleware to the request pipeline.
    /// Must be placed after UseAuthentication/UseAuthorization so the client id can include the user id.
    /// </summary>
    public static IApplicationBuilder UseMethodRateLimiter(this IApplicationBuilder app)
        => app.UseMiddleware<AspNetToolkit.Middleware.MethodRateLimitMiddleware>();

    /// <summary>
    /// Resolves the effective rate limit rule for a request with strict priority:
    /// 1) Endpoint-specific override (RateLimiterConfig.Endpoints) — returned immediately on match.
    /// 2) HTTP-method limit (RateLimiterConfig.HttpMethods) — returned on match.
    /// 3) Default fallback (RateLimiterConfig.Default) when neither of the above matches.
    /// Returns the partition scope, permit limit and window in minutes; PermitLimit &lt;= 0 means not throttled.
    /// </summary>
    public static (string Scope, int PermitLimit, int WindowMinutes) ResolveRateLimitRule(
        this RateLimiterConfig config, string basePath, string path, string method)
    {
        // Priority 1: endpoint-specific override wins over method and default limits.
        var endpoint = config.Endpoints.FirstOrDefault(f =>
            path.Equals(f.Path, StringComparison.OrdinalIgnoreCase) ||
            basePath.Equals(f.Path, StringComparison.OrdinalIgnoreCase));

        if (endpoint != null && endpoint.PermitLimit > 0)
            return ($"endpoint:{endpoint.Path}", endpoint.PermitLimit, Math.Max(endpoint.WindowInMinutes, 1));

        // Priority 2: HTTP-method-specific limit; ignored when unconfigured or disabled (PermitLimit <= 0).
        if (config.HttpMethods.TryGetValue(method, out var methodConfig) && methodConfig.PermitLimit > 0)
            return ($"method:{method}", methodConfig.PermitLimit, Math.Max(methodConfig.WindowInMinutes, 1));

        // Priority 3: default fallback for anything not matched above.
        return ("default", config.Default.PermitLimit, Math.Max(config.Default.WindowInMinutes, 1));
    }
}