package camel.harness.connectors.github.error;

import camel.harness.core.*;
/**
 * Base class for all GitHub connector failures. Messages produced by this
 * hierarchy must never contain credentials (see {@link GithubSecretSanitizer}).
 */
public class GithubException extends RuntimeException {

    private final int statusCode;

    public GithubException(String message) {
        this(message, 400);
    }

    public GithubException(String message, int statusCode) {
        super(message);
        this.statusCode = statusCode;
    }

    public GithubException(String message, Throwable cause, int statusCode) {
        super(message, cause);
        this.statusCode = statusCode;
    }

    public int statusCode() {
        return statusCode;
    }
}
