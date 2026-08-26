package camel.harness.connectors.github.client;

import camel.harness.connectors.github.auth.GithubAuthService;
import camel.harness.connectors.github.dto.GithubRequest;
import camel.harness.connectors.github.dto.GithubResponse;
import camel.harness.connectors.github.error.GithubApiException;
import camel.harness.connectors.github.error.GithubRateLimitException;
import camel.harness.connectors.github.util.GithubSecretSanitizer;
import camel.harness.core.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.camel.Exchange;
import org.apache.camel.ProducerTemplate;
import org.springframework.stereotype.Component;

/**
 * Unified GitHub REST client built on the existing {@code camel-http} component.
 * All GitHub actions funnel through this class; it handles URL construction,
 * the standard GitHub headers, JSON body encoding/decoding, pagination
 * aggregation, and rate-limit detection. Authentication is applied centrally via
 * {@link GithubAuthService} — never embedded here.
 */
@Component
public class GithubClient {

    private static final String DEFAULT_BASE_URL = "https://api.github.com";
    private static final Pattern LINK_NEXT = Pattern.compile("<[^>]*[?&]page=(\\d+)[^>]*>;\\s*rel=\"next\"");

    private final ProducerTemplate producerTemplate;
    private final ObjectMapper objectMapper;
    private final GithubAuthService authService;

    public GithubClient(ProducerTemplate producerTemplate, ObjectMapper objectMapper,
            GithubAuthService authService) {
        this.producerTemplate = producerTemplate;
        this.objectMapper = objectMapper;
        this.authService = authService;
    }

    /**
     * Executes a single GitHub REST request and returns the decoded response.
     */
    public GithubResponse execute(String baseUrl, GithubRequest request) {
        int maxPages = request.paginated() ? Math.max(1, request.maxPages()) : 1;
        if (maxPages > 1) {
            return executePaginated(baseUrl, request, maxPages);
        }
        return executeSingle(baseUrl, request, 1);
    }

    // ---------------------------------------------------------------------
    // Single request
    // ---------------------------------------------------------------------

    private GithubResponse executeSingle(String baseUrl, GithubRequest request, int page) {
        Map<String, String> headers = authService.authorizationHeaders(request.auth());
        request.headers().forEach((key, value) -> headers.put(key, String.valueOf(value)));

        Map<String, Object> query = new LinkedHashMap<>(request.queryParams());
        if (request.paginated() && page > 1) {
            query.put("page", page);
        }

        String uri = buildUri(baseUrl, request.path(), query);
        // camel-http component options must be separated from the HTTP query
        // string with '&' (not '?'), otherwise a query param like page=2 becomes
        // "2?httpMethod=GET" and the API rejects it. throwExceptionOnFailure=false
        // so 4xx/5xx responses come back as normal exchanges with their bodies,
        // letting us classify them below. deleteWithBody=true lets camel-http send
        // a JSON body on DELETE requests (e.g. GitHub's "Delete a file" contents
        // API requires {message, sha}); without it the producer silently drops the
        // body.
        String endpoint = appendComponentOptions(uri, "httpMethod=" + request.httpMethod()
                + "&throwExceptionOnFailure=false"
                + ("DELETE".equalsIgnoreCase(request.httpMethod()) ? "&deleteWithBody=true" : ""));
        Exchange response = producerTemplate.send(endpoint,
            exchange -> {
                headers.forEach((name, value) -> exchange.getMessage().setHeader(name, value));
                Object body = request.body();
                if (body != null) {
                    exchange.getMessage().setBody(normalizeBody(body));
                }
            });

        int status = response.getMessage().getHeader(Exchange.HTTP_RESPONSE_CODE, 0, Integer.class);
        String raw = response.getMessage().getBody(String.class);
        Map<String, Object> responseHeaders = safeHeaders(response);
        Object decoded = decodeBody(raw, status, request.httpMethod());
        if (status == 429 || isRateLimited(responseHeaders)) {
            long retryAfter = retryAfterSeconds(responseHeaders);
            throw new GithubRateLimitException(
                "GitHub API rate limit exceeded" + (retryAfter > 0 ? "; retry after " + retryAfter + "s" : ""),
                status, retryAfter);
        }
        if (status == 401) {
            // Token may have expired for OAuth; invalidate cache so the next call refreshes.
            authService.invalidate(request.auth());
            throw new GithubApiException("GitHub authentication failed (HTTP 401): check access token or OAuth credentials",
                401);
        }
        if (!isSuccess(status)) {
            throw new GithubApiException(
                "GitHub API error HTTP " + status + ": " + safeError(decoded), status);
        }

        Integer nextPage = nextPage(responseHeaders);
        return new GithubResponse(status, decoded, responseHeaders, nextPage);
    }

    // ------------------------------------------------------------------
    // Pagination
    // ------------------------------------------------------------------

    private GithubResponse executePaginated(String baseUrl, GithubRequest request, int maxPages) {
        List<Object> collected = new ArrayList<>();
        int page = 1;
        int status = 200;
        Map<String, Object> lastHeaders = Map.of();
        while (page <= maxPages) {
            GithubResponse response = executeSingle(baseUrl, request, page);
            status = response.statusCode();
            lastHeaders = response.headers();
            Object body = response.body();
            if (body instanceof List<?> list) {
                collected.addAll(list);
            } else {
                // Non-list response: return it as-is (nothing to aggregate).
                return response;
            }
            if (response.nextPage() == null) {
                break;
            }
            page = response.nextPage();
            if (page <= 1) {
                break;
            }
        }
        return new GithubResponse(status, collected, lastHeaders, null);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    /**
     * Appends camel-http component options to an endpoint URI. Component options
     * must be separated from any existing HTTP query string with {@code &} (not
     * {@code ?}), otherwise a query param like {@code page=2} becomes
     * {@code 2?httpMethod=GET} and the remote API rejects it.
     */
    private static String appendComponentOptions(String uri, String options) {
        return uri + (uri.contains("?") ? "&" : "?") + options;
    }

    private String buildUri(String baseUrl, String path, Map<String, Object> query) {
        String base = baseUrl == null || baseUrl.isBlank() ? DEFAULT_BASE_URL : stripTrailingSlash(baseUrl);
        String full = base + path;
        if (!query.isEmpty()) {
            StringBuilder qs = new StringBuilder("?");
            query.forEach((key, value) -> {
                if (qs.length() > 1) {
                    qs.append('&');
                }
                qs.append(urlEncode(key)).append('=').append(urlEncode(String.valueOf(value)));
            });
            full += qs;
        }
        return full;
    }

    private String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private Object normalizeBody(Object body) throws Exception {
        if (body instanceof Map || body instanceof List) {
            return objectMapper.writeValueAsString(body);
        }
        return body;
    }

    private Object decodeBody(String raw, int status, String httpMethod) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        // Error responses (4xx/5xx) always carry a JSON error body that must be
        // preserved so it can be surfaced in the error message. Successful
        // responses are decoded normally too (e.g. GitHub's "Delete a file"
        // returns 200 with the commit object); 204 no-content responses produce
        // an empty body here.
        String trimmed = raw.trim();
        try {
            if (trimmed.startsWith("{")) {
                return objectMapper.readValue(trimmed, Map.class);
            }
            if (trimmed.startsWith("[")) {
                return objectMapper.readValue(trimmed, List.class);
            }
        } catch (Exception e) {
            // Fall through to raw string.
        }
        return raw;
    }

    private Map<String, Object> safeHeaders(Exchange response) {
        Map<String, Object> headers = new LinkedHashMap<>();
        response.getMessage().getHeaders().forEach((name, value) -> {
            if (value == null || value instanceof String || value instanceof Number
                || value instanceof Boolean || value instanceof Character) {
                headers.put(name, value);
            }
        });
        return headers;
    }

    private boolean isRateLimited(Map<String, Object> headers) {
        Object remaining = headers.get("X-RateLimit-Remaining");
        return remaining != null && "0".equals(String.valueOf(remaining));
    }

    private long retryAfterSeconds(Map<String, Object> headers) {
        Object value = headers.get("Retry-After");
        if (value != null) {
            try {
                return Long.parseLong(String.valueOf(value));
            } catch (NumberFormatException ignored) {
                return 0;
            }
        }
        return 0;
    }

    private Integer nextPage(Map<String, Object> headers) {
        Object link = headers.get("Link");
        if (link == null) {
            return null;
        }
        Matcher matcher = LINK_NEXT.matcher(String.valueOf(link));
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group(1));
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private static boolean isSuccess(int status) {
        return status >= 200 && status < 300;
    }

    private static String safeError(Object decoded) {
        if (decoded instanceof Map<?, ?> map) {
            Object message = map.get("message");
            if (message != null) {
                return GithubSecretSanitizer.sanitize(String.valueOf(message));
            }
        }
        return "see GitHub response body";
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
