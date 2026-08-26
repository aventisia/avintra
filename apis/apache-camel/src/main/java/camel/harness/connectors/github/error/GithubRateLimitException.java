package camel.harness.connectors.github.error;

import camel.harness.core.*;
/**
 * Raised when GitHub rate limiting is hit (HTTP 429 or
 * {@code X-RateLimit-Remaining: 0}). Carries the retry-after hint when available.
 */
public class GithubRateLimitException extends GithubException {

    private final long retryAfterSeconds;

    public GithubRateLimitException(String message, int statusCode, long retryAfterSeconds) {
        super(message, statusCode);
        this.retryAfterSeconds = retryAfterSeconds;
    }

    public long retryAfterSeconds() {
        return retryAfterSeconds;
    }
}
