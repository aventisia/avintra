using System.Collections.Concurrent;
using System.Threading;

namespace AspNetToolkit.Middleware;

/// <summary>
/// Rate limiting middleware that enforces per-client, per-HTTP-method limits instead of a single global limit.
/// All thresholds and windows are configuration-driven from RateLimiterConfig (appsettings.json):
/// HttpMethods (e.g. GET 500/min, POST 50/min, PUT 50/min, PATCH 50/min, DELETE 10/min),
/// endpoint-specific overrides (Endpoints) and a fallback (Default).
/// Requests exceeding the limit receive HTTP 429 with Retry-After, X-RateLimit-Limit and
/// X-RateLimit-Remaining headers.
/// IMPORTANT NOTE: counters are in-process per API instance; behind multiple replicas each instance
/// enforces its own window, so the effective limit scales with instance count.
/// </summary>
public class MethodRateLimitMiddleware
{
    private const long CleanupIntervalMs = 60_000;

    private readonly RequestDelegate _next;
    private readonly RateLimiterConfig _config;
    private readonly ConcurrentDictionary<string, WindowState> _windows = new(StringComparer.Ordinal);
    private long _lastCleanup;

    public MethodRateLimitMiddleware(RequestDelegate next, RateLimiterConfig rateLimiterConfig)
    {
        _next = next;
        _config = rateLimiterConfig;
    }

    public async Task InvokeAsync(HttpContext httpContext)
    {
        // Long-lived WebSocket connections are negotiated once; do not throttle them per request.
        if (httpContext.WebSockets.IsWebSocketRequest)
        {
            await _next(httpContext);
            return;
        }

        var rule = ResolveRule(httpContext);

        // A resolved PermitLimit <= 0 means "not throttled" for that endpoint/method/default bucket.
        if (rule.PermitLimit <= 0)
        {
            await _next(httpContext);
            return;
        }

        var state = _windows.GetOrAdd(rule.PartitionKey, _ => new WindowState(rule.PermitLimit, rule.WindowMinutes));

        var granted = state.TryAcquire(Environment.TickCount64, out var remaining, out var retryAfterSeconds);
        MaybeCleanup(Environment.TickCount64);

        var headers = httpContext.Response.Headers;
        headers["X-RateLimit-Limit"] = rule.PermitLimit.ToString(CultureInfo.InvariantCulture);
        headers["X-RateLimit-Remaining"] = Math.Max(remaining, 0).ToString(CultureInfo.InvariantCulture);

        if (granted)
        {
            await _next(httpContext);
            return;
        }

        // Rejected: expose when the current window resets.
        headers["Retry-After"] = retryAfterSeconds.ToString(CultureInfo.InvariantCulture);
        httpContext.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
        httpContext.Response.ContentType = "text/plain";
        await httpContext.Response.WriteAsync("Too many requests. Please try later.", cancellationToken: httpContext.RequestAborted);
    }

    /// <summary>
    /// Resolves the rate limit rule for a request. Priority (endpoint → method → default) lives in
    /// RateLimiterServicesExtension.ResolveRateLimitRule; all values come from appsettings.json only.
    /// </summary>
    private (string PartitionKey, int PermitLimit, int WindowMinutes) ResolveRule(HttpContext httpContext)
    {
        var clientId = GetClientId(httpContext);
        var path = httpContext.Request.Path.Value?.ToLowerInvariant() ?? string.Empty;
        var basePath = string.Concat(httpContext.Request.PathBase.Value?.ToLowerInvariant(), path);
        var method = httpContext.Request.Method?.ToUpperInvariant() ?? string.Empty;

        var (scope, permitLimit, windowMinutes) = _config.ResolveRateLimitRule(basePath, path, method);

        return ($"{clientId}:{scope}", permitLimit, windowMinutes);
    }

    /// <summary>
    /// Builds a stable client identifier: forwarded/remote IP, combined with the user id when authenticated.
    /// </summary>
    private static string GetClientId(HttpContext httpContext)
    {
        var ip = httpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                 ?? httpContext.Connection.RemoteIpAddress?.ToString();

        var userId = httpContext.User?.Identity?.IsAuthenticated == true
            ? httpContext.User?.FindFirstValue("uid")
            : string.Empty;

        var host = httpContext.Request.Host.Host;

        return !string.IsNullOrEmpty(userId)
            ? $"{ip ?? host}:{userId}"
            : $"{ip ?? host ?? "unknown-client"}";
    }

    /// <summary>
    /// Removes window states whose fixed window has fully expired. Runs at most once per interval.
    /// </summary>
    private void MaybeCleanup(long now)
    {
        var last = Interlocked.Read(ref _lastCleanup);
        if (now - last < CleanupIntervalMs) return;

        if (Interlocked.CompareExchange(ref _lastCleanup, now, last) != last) return;

        foreach (var entry in _windows)
        {
            if (!entry.Value.IsExpired(now)) continue;

            // Remove only when the dictionary still maps this key to the same instance,
            // so a concurrent request never acquires from an orphaned counter.
            if (_windows.TryGetValue(entry.Key, out var current) && ReferenceEquals(current, entry.Value))
                _windows.TryRemove(new KeyValuePair<string, WindowState>(entry.Key, entry.Value));
        }
    }

    /// <summary>
    /// Thread-safe fixed-window counter: grants up to PermitLimit requests per configured window.
    /// Limits and window length are supplied from configuration, never hardcoded.
    /// </summary>
    private sealed class WindowState
    {
        private readonly object _lock = new();
        private readonly int _limit;
        private readonly int _windowMs;
        private long _windowStart;
        private int _count;

        public WindowState(int limit, int windowMinutes)
        {
            _limit = limit;
            _windowMs = windowMinutes * 60_000;
        }

        public bool IsExpired(long now)
        {
            lock (_lock)
            {
                return now - _windowStart >= _windowMs;
            }
        }

        public bool TryAcquire(long now, out int remaining, out int retryAfterSeconds)
        {
            lock (_lock)
            {
                // Start a new window once the previous one has fully elapsed.
                if (now - _windowStart >= _windowMs)
                {
                    _windowStart = now;
                    _count = 0;
                }

                if (_count < _limit)
                {
                    _count++;
                    remaining = _limit - _count;
                    retryAfterSeconds = 0;
                    return true;
                }

                remaining = 0;
                var msUntilReset = _windowStart + _windowMs - now;
                retryAfterSeconds = Math.Max(1, (int)Math.Ceiling(msUntilReset / 1000.0));
                return false;
            }
        }
    }
}