package camel.harness.connectors.github.dto;

import camel.harness.core.*;
import java.util.Map;

/**
 * Result of a GitHub REST call, produced by {@link GithubClient}. The {@code body}
 * is already converted to a JSON-friendly object (Map/List/String) so it can be
 * embedded directly in the harness response envelope.
 *
 * @param statusCode HTTP status code
 * @param body       decoded body (Map/List/String) or null for empty responses
 * @param headers    response headers (safe, serializable values only)
 * @param nextPage   next page number if the response has a Link rel="next" header
 */
public record GithubResponse(
        int statusCode,
        Object body,
        Map<String, Object> headers,
        Integer nextPage) {

    public boolean isSuccess() {
        return statusCode >= 200 && statusCode < 300;
    }
}
