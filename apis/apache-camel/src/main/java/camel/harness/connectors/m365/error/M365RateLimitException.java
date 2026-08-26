package camel.harness.connectors.m365.error;

import camel.harness.connectors.m365.dto.M365ErrorType;

/**
 * Raised when Microsoft Graph throttling is hit (HTTP 429 or 503 with
 * {@code Retry-After}). Carries the retry-after hint when available so callers
 * can back off before retrying. Maps to {@link M365ErrorType#RATE_LIMITED}.
 */
public class M365RateLimitException extends M365Exception {

    private final long retryAfterSeconds;

    public M365RateLimitException(String message, int statusCode, long retryAfterSeconds) {
        super(message, statusCode, M365ErrorType.RATE_LIMITED);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long retryAfterSeconds() {
        return retryAfterSeconds;
    }
}
