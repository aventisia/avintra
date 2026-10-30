namespace GlobalAdminAPIs.Services;

public class EmailRateLimiterService : IEmailRateLimiterService
{
    private const string LastEmailSentKeyFormat = "EmailRateLimit:{0}:{1}";  // {0} = IP, {1} = EmailType

    private readonly IMemoryCache _memoryCache;
    private readonly string CLIENT_IP;

    public EmailRateLimiterService(IMemoryCache memoryCache, IHttpContextAccessor httpContextAccessor)
    {
        _memoryCache = memoryCache;

        // Get the client's IP address
        CLIENT_IP = httpContextAccessor.HttpContext?.Request.Headers["X-Forwarded-For"].FirstOrDefault()
                   ?? httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString()
                   ?? "unknown";
    }

    public bool CanSendEmail(EmailTypesEnum emailType, TimeSpan rateLimitDuration = default)
    {
        // Default to 12 hours if no duration is provided
        if (rateLimitDuration == default)
        {
            rateLimitDuration = TimeSpan.FromHours(12);
        }

        // Generate a cache key based on the client's IP address and email type
        var emailKey = string.Format(LastEmailSentKeyFormat, CLIENT_IP, emailType);

        // Check if the email has already been sent to this IP address for the given email type in the last 'rateLimitDuration' hours
        if (_memoryCache.TryGetValue(emailKey, out DateTimeOffset lastEmailSent))
        {
            // If the email was sent within the rate limit window, return false (do not send email)
            if (DateTimeOffset.UtcNow - lastEmailSent < rateLimitDuration)
            {
                return false;  // Do not send the email
            }
        }

        // If the email was sent more than the rate limit period ago, return true (allow sending email)
        return true;
    }

    public void UpdateEmailTimestamp(EmailTypesEnum emailType, TimeSpan rateLimitDuration = default)
    {
        // Default to 12 hours if no duration is provided
        if (rateLimitDuration == default)
        {
            rateLimitDuration = TimeSpan.FromHours(12);
        }

        // Generate a cache key based on the client's IP address and email type
        var emailKey = string.Format(LastEmailSentKeyFormat, CLIENT_IP, emailType);

        // Update the timestamp in the cache for the given IP address and email type
        _memoryCache.Set(emailKey, DateTimeOffset.UtcNow, rateLimitDuration);  // Cache expiration set to rate limit duration
    }
}