package camel.harness.connectors.m365.client;

import camel.harness.connectors.m365.M365Defaults;
import camel.harness.connectors.m365.auth.M365AuthService;
import camel.harness.connectors.m365.dto.M365ErrorType;
import camel.harness.connectors.m365.dto.M365Request;
import camel.harness.connectors.m365.dto.M365Response;
import camel.harness.connectors.m365.error.M365ApiException;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.connectors.m365.error.M365RateLimitException;
import camel.harness.connectors.m365.util.M365SecretSanitizer;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.camel.Exchange;
import org.apache.camel.ProducerTemplate;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Unified Microsoft Graph REST client built on the existing {@code camel-http}
 * component. All M365 actions funnel through this class; it handles URL
 * construction, the standard Graph headers, JSON body encoding/decoding,
 * {@code @odata.nextLink} pagination, transient-failure retry with backoff, and
 * throttling ({@code 429}/{@code 503} with {@code Retry-After}). Authentication
 * is applied centrally via {@link M365AuthService} — never embedded here.
 */
@Component
public class M365Client {

    private static final int DEFAULT_RETRY_ATTEMPTS = 3;
    private static final long DEFAULT_RETRY_BASE_MS = 250L;

    private final ProducerTemplate producerTemplate;
    private final ObjectMapper objectMapper;
    private final M365AuthService authService;
    private final Environment environment;

    public M365Client(ProducerTemplate producerTemplate, ObjectMapper objectMapper,
            M365AuthService authService, Environment environment) {
        this.producerTemplate = producerTemplate;
        this.objectMapper = objectMapper;
        this.authService = authService;
        this.environment = environment;
    }

    /**
     * Executes a single Microsoft Graph request with retries and returns the
     * decoded response. If the action is paginated, follows {@code @odata.nextLink}
     * up to {@code maxPages} pages and aggregates the {@code value} arrays.
     */
    public M365Response execute(String baseUrl, M365Request request) {
        if (request.paginated()) {
            return executePaginated(baseUrl, request);
        }
        return executeSingle(baseUrl, request, 1);
    }

    // ---------------------------------------------------------------------
    // Single request (with retry)
    // ---------------------------------------------------------------------

    private M365Response executeSingle(String baseUrl, M365Request request, int attempt) {
        Map<String, String> headers = authService.authorizationHeaders(request.auth());
        request.headers().forEach((key, value) -> headers.put(key, String.valueOf(value)));
        // Microsoft Graph requires a Content-Type on any request carrying a body
        // (e.g. POST/PATCH sendMail). camel-http does not infer one from a
        // serialized JSON string, so default to application/json unless the
        // caller supplied an explicit content type (e.g. configuration.contentType
        // for teamsmessage.send or multipart uploads).
        Object payload = request.body();
        if (payload != null && !hasHeaderIgnoreCase(headers, "Content-Type")) {
            headers.put("Content-Type", "application/json");
        }

        String uri = buildUri(baseUrl, request.path(), request.queryParams());
        // camel-http component options must be separated from the HTTP query
        // string with '&' (not '?'), otherwise a query param like $top=10 becomes
        // "10?httpMethod=GET" and Graph rejects it. throwExceptionOnFailure=false
        // so 4xx/5xx responses come back as normal exchanges with their bodies,
        // letting us classify them below.
        String endpoint = appendComponentOptions(uri, "httpMethod=" + request.httpMethod()
                + "&throwExceptionOnFailure=false");
        Exchange response = producerTemplate.send(endpoint,
            exchange -> {
                headers.forEach((name, value) -> exchange.getMessage().setHeader(name, value));
                if (payload != null) {
                    exchange.getMessage().setBody(normalizeBody(payload));
                }
            });

        int status = response.getMessage().getHeader(Exchange.HTTP_RESPONSE_CODE, 0, Integer.class);
        String raw = response.getMessage().getBody(String.class);
        Map<String, Object> responseHeaders = safeHeaders(response);
        Object decoded = decodeBody(raw, request.httpMethod());

        if (status == 429 || status == 503) {
            long retryAfter = retryAfterSeconds(responseHeaders);
            if (attempt < retryAttempts(request)) {
                sleepBackoff(attempt, retryAfter);
                return executeSingle(baseUrl, request, attempt + 1);
            }
            throw new M365RateLimitException(
                "Microsoft Graph throttling (HTTP " + status + ")"
                    + (retryAfter > 0 ? "; retry after " + retryAfter + "s" : ""),
                status, retryAfter);
        }
        if (status == 401) {
            // Token may have expired; invalidate cache so the next call refreshes.
            authService.invalidate(request.auth());
            throw new M365ApiException("Microsoft Graph authentication failed (HTTP 401): "
                + "check access token or OAuth credentials", 401, "Unauthorized");
        }
        if (isTransient(status)) {
            if (attempt < retryAttempts(request)) {
                sleepBackoff(attempt, 0);
                return executeSingle(baseUrl, request, attempt + 1);
            }
        }
        if (!isSuccess(status)) {
            M365ApiException error = apiError(status, decoded);
            throw error;
        }

        String nextLink = nextLink(decoded);
        return new M365Response(status, decoded, responseHeaders, nextLink);
    }

    // ------------------------------------------------------------------
    // Pagination (@odata.nextLink)
    // ------------------------------------------------------------------

    private M365Response executePaginated(String baseUrl, M365Request request) {
        int maxPages = Math.max(1, request.maxPages());
        List<Object> collected = new ArrayList<>();
        int status = 200;
        Map<String, Object> lastHeaders = Map.of();
        int page = 1;
        String path = request.path();
        Map<String, Object> query = new LinkedHashMap<>(request.queryParams());
        String nextLink = null;
        while (page <= maxPages) {
            M365Response response = executeSingle(baseUrl, request, path, query, 1);
            status = response.statusCode();
            lastHeaders = response.headers();
            Object value = extractValue(response.body());
            if (value instanceof List<?> list) {
                collected.addAll(list);
            } else if (page == 1) {
                // Non-list response: return it as-is (nothing to aggregate).
                return response;
            }
            nextLink = response.nextLink();
            if (nextLink == null || nextLink.isBlank()) {
                break;
            }
            // Follow @odata.nextLink: it carries the full URL; reuse its path+query.
            // Graph's nextLink path includes the "/v1.0" version segment (canonical
            // URL). Strip the base URL's path prefix so it is not duplicated when
            // re-concatenated in buildUri — otherwise the second page hits
            // ".../v1.0/v1.0/users/..." and Graph rejects it with "Resource not
            // found for the segment 'v1.0'".
            String[] parts = splitNextLink(nextLink);
            path = stripBasePath(baseUrl, parts[0]);
            query = parts[1] == null ? new LinkedHashMap<>() : parseQuery(parts[1]);
            page++;
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("value", collected);
        return new M365Response(status, result, lastHeaders, nextLink);
    }

    private M365Response executeSingle(String baseUrl, M365Request request, String path,
            Map<String, Object> query, int attempt) {
        M365Request paged = M365Request.builder()
            .id(request.id())
            .path(path)
            .httpMethod(request.httpMethod())
            .queryParams(query)
            .headers(request.headers())
            .body(request.body())
            .auth(request.auth())
            .paginated(false)
            .maxPages(request.maxPages())
            .build();
        return executeSingle(baseUrl, paged, attempt);
    }

    static String[] splitNextLink(String nextLink) {
        int schemeEnd = nextLink.indexOf("//");
        int pathStart = schemeEnd > 0 ? nextLink.indexOf('/', schemeEnd + 2) : -1;
        if (pathStart < 0) {
            pathStart = 0;
        }
        int q = nextLink.indexOf('?', pathStart);
        if (q > 0) {
            return new String[] { nextLink.substring(pathStart, q), nextLink.substring(q + 1) };
        }
        return new String[] { nextLink.substring(pathStart), null };
    }

    /**
     * Strips the base URL's path prefix (e.g. {@code /v1.0}) from a nextLink path
     * so it can be re-concatenated with the base URL without duplicating the
     * version segment. Graph's {@code @odata.nextLink} carries the full canonical
     * path including {@code /v1.0}; the base URL already ends with it, so naive
     * concatenation produces {@code https://graph.microsoft.com/v1.0/v1.0/users/...}
     * which Graph rejects with "Resource not found for the segment 'v1.0'".
     */
    static String stripBasePath(String baseUrl, String nextPath) {
        if (baseUrl == null || nextPath == null) {
            return nextPath;
        }
        int schemeEnd = baseUrl.indexOf("//");
        int pathStart = schemeEnd > 0 ? baseUrl.indexOf('/', schemeEnd + 2) : -1;
        if (pathStart < 0) {
            return nextPath;
        }
        String basePath = baseUrl.substring(pathStart);
        if (!basePath.isEmpty() && nextPath.startsWith(basePath)) {
            return nextPath.substring(basePath.length());
        }
        return nextPath;
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private static boolean hasHeaderIgnoreCase(Map<String, String> headers, String name) {
        return headers.keySet().stream().anyMatch(k -> k.equalsIgnoreCase(name));
    }

    /**
     * Appends camel-http component options to an endpoint URI. Component options
     * must be separated from any existing HTTP query string with {@code &} (not
     * {@code ?}), otherwise a query param like {@code $top=10} becomes
     * {@code 10?httpMethod=GET} and the remote API rejects it.
     */
    private static String appendComponentOptions(String uri, String options) {
        return uri + (uri.contains("?") ? "&" : "?") + options;
    }

    private String buildUri(String baseUrl, String path, Map<String, Object> query) {
        String base = baseUrl == null || baseUrl.isBlank()
            ? M365Defaults.baseUrl(environment) : stripTrailingSlash(baseUrl);
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

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private Object normalizeBody(Object body) throws Exception {
        if (body instanceof Map || body instanceof List) {
            return objectMapper.writeValueAsString(body);
        }
        return body;
    }

    private Object decodeBody(String raw, String httpMethod) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        if ("DELETE".equalsIgnoreCase(httpMethod)) {
            return null;
        }
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
        // camel-http also exposes response headers under the
        // "CamelHttpResponseHeaders" exchange property (a Map of name -> List);
        // merge them (case-insensitively) so Retry-After and friends are found.
        Object rawHeaders = response.getProperty("CamelHttpResponseHeaders");
        if (rawHeaders instanceof Map<?, ?> map) {
            map.forEach((name, value) -> {
                if (name instanceof String key && !containsKeyIgnoreCase(headers, key)) {
                    headers.put(key, firstHeaderValue(value));
                }
            });
        }
        return headers;
    }

    private static boolean containsKeyIgnoreCase(Map<String, Object> headers, String key) {
        return headers.keySet().stream().anyMatch(k -> k.equalsIgnoreCase(key));
    }

    private static Object firstHeaderValue(Object value) {
        if (value instanceof List<?> list && !list.isEmpty()) {
            return list.get(0);
        }
        return value;
    }

    private long retryAfterSeconds(Map<String, Object> headers) {
        for (Map.Entry<String, Object> entry : headers.entrySet()) {
            if ("retry-after".equalsIgnoreCase(entry.getKey()) && entry.getValue() != null) {
                try {
                    return Long.parseLong(String.valueOf(entry.getValue()));
                } catch (NumberFormatException ignored) {
                    return 0;
                }
            }
        }
        return 0;
    }

    private int retryAttempts(M365Request request) {
        return DEFAULT_RETRY_ATTEMPTS;
    }

    private void sleepBackoff(int attempt, long retryAfter) {
        long delay;
        if (retryAfter > 0) {
            delay = TimeUnit.SECONDS.toMillis(Math.min(retryAfter, 30));
        } else {
            delay = DEFAULT_RETRY_BASE_MS * (1L << (attempt - 1));
        }
        try {
            Thread.sleep(delay);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static boolean isTransient(int status) {
        return status == 500 || status == 502 || status == 504;
    }

    private static boolean isSuccess(int status) {
        return status >= 200 && status < 300;
    }

    private static Object extractValue(Object body) {
        if (body instanceof Map<?, ?> map) {
            return map.get("value");
        }
        return null;
    }

    private static String nextLink(Object decoded) {
        if (decoded instanceof Map<?, ?> map) {
            Object link = map.get("@odata.nextLink");
            if (link != null) {
                return String.valueOf(link);
            }
        }
        return null;
    }

    private M365ApiException apiError(int status, Object decoded) {
        String message = "Microsoft Graph API error HTTP " + status;
        String code = null;
        if (decoded instanceof Map<?, ?> map) {
            Object error = map.get("error");
            if (error instanceof Map<?, ?> errorMap) {
                Object messageValue = errorMap.get("message");
                code = errorMap.get("code") != null ? String.valueOf(errorMap.get("code")) : null;
                if (messageValue != null) {
                    message = M365SecretSanitizer.sanitize(String.valueOf(messageValue));
                } else {
                    message = "Microsoft Graph API error HTTP " + status;
                }
            } else if (map.get("message") != null) {
                message = M365SecretSanitizer.sanitize(String.valueOf(map.get("message")));
            }
        }
        return new M365ApiException(message, status, refineType(status, code), code);
    }

    /**
     * Refines the canonical error type from the Graph error code when the status
     * alone is ambiguous (e.g. 403 with {@code AuthorizationRequestDenied} or
     * {@code AccessDenied} is an insufficient-permission rather than a generic
     * provider error).
     */
    private static M365ErrorType refineType(int status, String graphCode) {
        M365ErrorType base = M365Exception.classify(status);
        if (status == 403 && graphCode != null) {
            String c = graphCode.toLowerCase();
            if (c.contains("authorization") || c.contains("accessdenied") || c.contains("permission")) {
                return M365ErrorType.INSUFFICIENT_PERMISSIONS;
            }
        }
        if (status == 404 && graphCode != null) {
            String c = graphCode.toLowerCase();
            if (c.contains("notfound")) {
                return M365ErrorType.NOT_FOUND;
            }
        }
        return base;
    }

    private static Map<String, Object> parseQuery(String query) {
        Map<String, Object> result = new LinkedHashMap<>();
        for (String pair : query.split("&")) {
            int eq = pair.indexOf('=');
            if (eq > 0) {
                result.put(java.net.URLDecoder.decode(pair.substring(0, eq), java.nio.charset.StandardCharsets.UTF_8),
                    java.net.URLDecoder.decode(pair.substring(eq + 1), java.nio.charset.StandardCharsets.UTF_8));
            }
        }
        return result;
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
