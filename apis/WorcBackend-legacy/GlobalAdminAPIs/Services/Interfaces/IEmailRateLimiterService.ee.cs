namespace GlobalAdminAPIs.Services;

public interface IEmailRateLimiterService
{
    /// <summary>
    /// Checks whether an email of a specific type should be sent to the given IP based on the rate limit.
    /// </summary>
    /// <param name="emailType">The type of the email being sent (e.g., "InvalidRequest", "Verification").</param>
    /// <param name="rateLimitDuration">The duration for which the rate limit is applied (default: 12 hours).</param>
    /// <returns>Returns true if the email can be sent, otherwise false.</returns>
    bool CanSendEmail(EmailTypesEnum emailType, TimeSpan rateLimitDuration = default);

    /// <summary>
    /// Updates the cache to track the time the email of the specified type was sent for the given IP address.
    /// </summary>
    /// <param name="emailType">The type of the email being sent (e.g., "InvalidRequest", "Verification").</param>
    /// <param name="rateLimitDuration">The duration for which the rate limit is applied (default: 12 hours).</param>
    void UpdateEmailTimestamp(EmailTypesEnum emailType, TimeSpan rateLimitDuration = default);
}