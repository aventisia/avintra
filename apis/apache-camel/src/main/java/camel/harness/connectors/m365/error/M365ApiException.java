package camel.harness.connectors.m365.error;

import camel.harness.connectors.m365.dto.M365ErrorType;

/**
 * Raised when the Microsoft Graph API returns a non-success status. The message
 * is derived from the Graph error body ({@code error.message}) and sanitized so
 * no credentials leak.
 */
public class M365ApiException extends M365Exception {

    private final String code;

    public M365ApiException(String message, int statusCode) {
        this(message, statusCode, null);
    }

    public M365ApiException(String message, int statusCode, String code) {
        super(message, statusCode, M365Exception.classify(statusCode));
        this.code = code;
    }

    /** Full constructor: explicit canonical error type plus the Graph error code. */
    public M365ApiException(String message, int statusCode, M365ErrorType errorType, String code) {
        super(message, statusCode, errorType);
        this.code = code;
    }

    /** The Graph {@code error.code} value, when present. */
    public String code() {
        return code;
    }
}
