package camel.harness.connectors.m365.dto;

/**
 * Canonical error taxonomy for the M365 connector. Every failure surfaced to a
 * consumer maps to one of these stable codes, while the provider (Microsoft
 * Graph) message and HTTP status are preserved alongside.
 *
 * <p>Consumers should switch on {@link #code()} (never on the raw message or
 * class name). The mapping lives in {@link M365Client} (HTTP status + Graph
 * {@code error.code}) and {@link M365Routes}/{@code ConnectorApiRoute} for the
 * envelope.</p>
 */
public enum M365ErrorType {

    /** Request failed validation before reaching Microsoft Graph. */
    INVALID_INPUT("invalid_input"),

    /** A required parameter (path/configuration) was not supplied. */
    MISSING_PARAMETER("missing_parameter"),

    /** Token missing/expired/invalid (HTTP 401 or token acquisition failure). */
    AUTHENTICATION_FAILED("authentication_failed"),

    /** The token is valid but lacks the required permission (HTTP 403). */
    INSUFFICIENT_PERMISSIONS("insufficient_permissions"),

    /** The requested resource does not exist (HTTP 404). */
    NOT_FOUND("not_found"),

    /** The operation conflicts with current state (HTTP 409/412). */
    CONFLICT("conflict"),

    /** Microsoft Graph throttling (HTTP 429/503 with Retry-After). */
    RATE_LIMITED("rate_limited"),

    /** Microsoft Graph returned a non-success error body (HTTP 4xx/5xx). */
    PROVIDER_ERROR("provider_error"),

    /** Network-level failure (connect, DNS, TLS). */
    NETWORK("network_error"),

    /** The operation exceeded its allowed time. */
    TIMEOUT("timeout"),

    /** The operation is not implemented/supported by this connector. */
    UNSUPPORTED_OPERATION("unsupported_operation"),

    /** Any failure not otherwise classified. */
    UNKNOWN("unknown");

    private final String code;

    M365ErrorType(String code) {
        this.code = code;
    }

    public String code() {
        return code;
    }
}
