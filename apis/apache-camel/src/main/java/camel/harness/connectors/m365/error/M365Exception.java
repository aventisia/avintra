package camel.harness.connectors.m365.error;

import camel.harness.connectors.m365.dto.M365ErrorType;
import camel.harness.connectors.m365.util.M365SecretSanitizer;

/**
 * Base class for all M365 connector failures. Messages produced by this
 * hierarchy must never contain credentials (see {@link M365SecretSanitizer}).
 *
 * <p>Every failure carries a {@link M365ErrorType} code so consumers can switch
 * on a stable taxonomy, plus the HTTP status that is surfaced in the error
 * envelope.</p>
 */
public class M365Exception extends RuntimeException {

    private final int statusCode;
    private final M365ErrorType errorType;

    public M365Exception(String message) {
        this(message, 400, M365ErrorType.UNKNOWN);
    }

    public M365Exception(String message, int statusCode) {
        this(message, statusCode, classify(statusCode));
    }

    public M365Exception(String message, int statusCode, M365ErrorType errorType) {
        super(message);
        this.statusCode = statusCode;
        this.errorType = errorType != null ? errorType : classify(statusCode);
    }

    public M365Exception(String message, Throwable cause, int statusCode) {
        super(message, cause);
        this.statusCode = statusCode;
        this.errorType = classify(statusCode);
    }

    public int statusCode() {
        return statusCode;
    }

    /** Canonical error code for consumers; never null. */
    public M365ErrorType errorType() {
        return errorType;
    }

    /** Map a status code to the most likely canonical error type. */
    /** Canonical error type for a given HTTP status; public so client code in other
     * packages (e.g. {@code M365Client} in {@code ...m365.client}) can classify
     * responses without duplicating the taxonomy. */
    public static M365ErrorType classify(int status) {
        return switch (status) {
            case 400 -> M365ErrorType.INVALID_INPUT;
            case 401 -> M365ErrorType.AUTHENTICATION_FAILED;
            case 403 -> M365ErrorType.INSUFFICIENT_PERMISSIONS;
            case 404 -> M365ErrorType.NOT_FOUND;
            case 409, 412 -> M365ErrorType.CONFLICT;
            case 429, 503 -> M365ErrorType.RATE_LIMITED;
            default -> M365ErrorType.PROVIDER_ERROR;
        };
    }
}
