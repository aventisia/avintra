package camel.harness.connectors.github.error;

import camel.harness.core.*;
/**
 * Raised when the GitHub REST API returns a non-success status. The message is
 * derived from the GitHub error body and sanitized so no credentials leak.
 */
public class GithubApiException extends GithubException {

    public GithubApiException(String message, int statusCode) {
        super(message, statusCode);
    }
}
