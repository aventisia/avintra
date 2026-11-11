namespace GlobalAdminAPIs.Config;

/// <summary>
/// Represents the configuration for rate limiting, including custom endpoint settings and default settings.
/// </summary>
public class RateLimiterConfig
{
    /// <summary>
    /// Gets or sets the list of rate limit configurations for specific endpoints.
    /// </summary>
    public List<RateLimitEndpoint> Endpoints { get; set; } = new();

    /// <summary>
    /// Gets or sets the default rate limit configuration for all endpoints that don't have custom configurations.
    /// </summary>
    public RateLimitDefault Default { get; set; } = new();
}

/// <summary>
/// Represents the rate limit configuration for a specific endpoint.
/// </summary>
public class RateLimitEndpoint
{
    /// <summary>
    /// Gets or sets the path for which the rate limit is applied.
    /// Example: "/api/products"
    /// </summary>
    public required string Path { get; set; }

    /// <summary>
    /// Gets or sets the number of allowed requests for the specified endpoint within the time window.
    /// Must be a positive value.
    /// </summary>
    public int PermitLimit { get; set; }

    /// <summary>
    /// Gets or sets the duration (in minutes) of the time window for rate limiting.
    /// Must be a positive value.
    /// </summary>
    public int WindowInMinutes { get; set; }
}

/// <summary>
/// Represents the default rate limit configuration applied to all endpoints that don't have custom configurations.
/// </summary>
public class RateLimitDefault
{
    /// <summary>
    /// Gets or sets the default number of allowed requests for any endpoint.
    /// Must be a positive value.
    /// </summary>
    public int PermitLimit { get; set; }

    /// <summary>
    /// Gets or sets the default time window (in minutes) for rate limiting.
    /// Must be a positive value.
    /// </summary>
    public int WindowInMinutes { get; set; }

    /// <summary>
    /// Gets or sets the queue limit, which determines how many requests can be queued while waiting for the rate limit to reset.
    /// Must be a non-negative value.
    /// </summary>
    public int QueueLimit { get; set; }
}