package camel.harness.connectors.m365.dto;

import java.util.Map;

/**
 * Result of a Microsoft Graph REST call, produced by {@link M365Client}. The
 * {@code body} is already converted to a JSON-friendly object (Map/List/String)
 * so it can be embedded directly in the harness response envelope.
 *
 * @param statusCode HTTP status code
 * @param body       decoded body (Map/List/String) or null for empty responses
 * @param headers    response headers (safe, serializable values only)
 * @param nextLink   {@code @odata.nextLink} URL when the response is paginated
 */
public record M365Response(
        int statusCode,
        Object body,
        Map<String, Object> headers,
        String nextLink) {

    public boolean isSuccess() {
        return statusCode >= 200 && statusCode < 300;
    }
}
