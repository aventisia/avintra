package camel.harness.connectors.github.auth;

import camel.harness.connectors.github.error.GithubException;
import camel.harness.core.*;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.camel.Exchange;
import org.apache.camel.ProducerTemplate;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Central authentication layer for all GitHub connector routes. Every action
 * delegates here; no per-route auth logic exists anywhere else.
 *
 * <p>Supported {@code auth.type} values:</p>
 * <ul>
 *   <li>{@code accessToken} / {@code bearer} — {@code Authorization: Bearer <token>}</li>
 *   <li>{@code apiKey} — sent as a bearer token by default, or via the
 *       {@code apiKeyHeader} header when provided</li>
 *   <li>{@code oauth2} — acquires/refreshes an access token from the token
 *       endpoint, caches it in {@link OAuthTokenCache}, and reuses it across
 *       requests until expiry or a 401 triggers a refresh</li>
 * </ul>
 *
 * <p>Credentials may also be supplied through application properties/environment
 * (e.g. {@code github.auth.token}, {@code github.auth.client-id}) so nothing is
 * ever hard-coded. Secrets are never included in exceptions or logs.</p>
 */
@Component
public class GithubAuthService {

    private static final String DEFAULT_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_ACCEPT = "application/vnd.github+json";

    private final ProducerTemplate producerTemplate;
    private final ObjectMapper objectMapper;
    private final OAuthTokenCache tokenCache;
    private final Environment environment;

    public GithubAuthService(ProducerTemplate producerTemplate, ObjectMapper objectMapper,
            OAuthTokenCache tokenCache, Environment environment) {
        this.producerTemplate = producerTemplate;
        this.objectMapper = objectMapper;
        this.tokenCache = tokenCache;
        this.environment = environment;
    }

    /**
     * Returns the authorization headers to attach to a GitHub REST request for the
     * given auth configuration, or an empty map for unauthenticated calls.
     */
    public Map<String, String> authorizationHeaders(AuthConfiguration auth) {
        Map<String, String> headers = new LinkedHashMap<>();
        headers.put("Accept", GITHUB_ACCEPT);
        headers.put("X-GitHub-Api-Version", "2022-11-28");
        if (auth == null || auth.authType() == AuthType.NONE) {
            return headers;
        }
        switch (auth.authType()) {
            case BEARER, ACCESS_TOKEN -> {
                String token = firstNonBlank(auth.token(), env("github.auth.token"));
                if (token != null) {
                    headers.put("Authorization", "Bearer " + token);
                }
            }
            case API_KEY -> {
                String key = firstNonBlank(auth.apiKey(), env("github.auth.api-key"));
                if (key != null) {
                    String header = firstNonBlank(auth.apiKeyHeader(), env("github.auth.api-key-header"), "Authorization");
                    if ("Authorization".equalsIgnoreCase(header)) {
                        headers.put("Authorization", "Bearer " + key);
                    } else {
                        headers.put(header, key);
                    }
                }
            }
            case OAUTH2 -> {
                String token = resolveOAuthToken(auth);
                if (token != null) {
                    headers.put("Authorization", "Bearer " + token);
                }
            }
            default -> {
                // Unsupported auth type for GitHub; leave unauthenticated. A
                // missing credential produces a safe validation error downstream.
            }
        }
        return headers;
    }

    /**
     * Returns the effective access token for OAuth2, acquiring one on first use
     * (client-credentials or authorization-code + refresh) and refreshing from the
     * token endpoint when cached tokens expire.
     */
    public String resolveOAuthToken(AuthConfiguration auth) {
        String key = cacheKey(auth);
        String cached = tokenCache.accessToken(key);
        if (cached != null) {
            return cached;
        }
        String refreshToken = firstNonBlank(auth.refreshToken(), env("github.auth.refresh-token"));
        if (refreshToken != null) {
            return refreshOrExchange(auth, key, refreshToken, true);
        }
        return clientCredentials(auth, key);
    }

    /** Invalidates the cached OAuth token, e.g. after a 401 from GitHub. */
    public void invalidate(AuthConfiguration auth) {
        if (auth != null && auth.authType() == AuthType.OAUTH2) {
            tokenCache.invalidate(cacheKey(auth));
        }
    }

    // ---------------------------------------------------------------------
    // OAuth token endpoint exchange
    // ---------------------------------------------------------------------

    private String refreshOrExchange(AuthConfiguration auth, String key, String refreshToken, boolean refresh) {
        Map<String, Object> form = new LinkedHashMap<>();
        form.put("grant_type", refresh ? "refresh_token" : "authorization_code");
        form.put("client_id", required(auth.clientId(), env("github.auth.client-id"), "OAuth clientId"));
        form.put("client_secret", required(auth.clientSecret(), env("github.auth.client-secret"), "OAuth clientSecret"));
        if (refresh) {
            form.put("refresh_token", refreshToken);
        } else if (auth.token() != null) {
            form.put("code", auth.token());
        }
        if (auth.scopes() != null && !auth.scopes().isBlank()) {
            form.put("scope", auth.scopes());
        }
        Map<String, Object> response = postForm(authToken(auth), form);
        String accessToken = (String) response.get("access_token");
        if (accessToken == null || accessToken.isBlank()) {
            throw new GithubException("OAuth token exchange did not return an access_token", 401);
        }
        Object expiresIn = response.get("expires_in");
        Long expires = expiresIn instanceof Number n ? n.longValue() : null;
        Object newRefresh = response.get("refresh_token");
        tokenCache.put(key, accessToken,
            newRefresh != null ? newRefresh.toString() : refreshToken, expires);
        return accessToken;
    }

    private String clientCredentials(AuthConfiguration auth, String key) {
        Map<String, Object> form = new LinkedHashMap<>();
        form.put("grant_type", "client_credentials");
        form.put("client_id", required(auth.clientId(), env("github.auth.client-id"), "OAuth clientId"));
        form.put("client_secret", required(auth.clientSecret(), env("github.auth.client-secret"), "OAuth clientSecret"));
        if (auth.scopes() != null && !auth.scopes().isBlank()) {
            form.put("scope", auth.scopes());
        }
        Map<String, Object> response = postForm(authToken(auth), form);
        String accessToken = (String) response.get("access_token");
        if (accessToken == null || accessToken.isBlank()) {
            throw new GithubException("OAuth client-credentials exchange did not return an access_token", 401);
        }
        Object expiresIn = response.get("expires_in");
        Long expiresInSeconds = expiresIn instanceof Number n ? n.longValue() : null;
        tokenCache.put(key, accessToken, null, expiresInSeconds);
        return accessToken;
    }

    private Map<String, Object> postForm(String url, Map<String, Object> form) {
        // throwExceptionOnFailure=false so 4xx/5xx responses return as exchanges
        // and can be classified into a sanitized GithubException below. Use '&' to
        // append component options in case the token URL already carries a query.
        Exchange response = producerTemplate.send(appendComponentOptions(url,
                "httpMethod=POST&throwExceptionOnFailure=false"),
            exchange -> {
                exchange.getMessage().setHeader(Exchange.CONTENT_TYPE, "application/x-www-form-urlencoded");
                exchange.getMessage().setBody(encodeForm(form));
            });
        int status = response.getMessage().getHeader(Exchange.HTTP_RESPONSE_CODE, 0, Integer.class);
        String body = response.getMessage().getBody(String.class);
        if (status < 200 || status >= 300) {
            throw new GithubException(
                "OAuth token endpoint returned HTTP " + status + ": " + safeError(body), status);
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = body == null || body.isBlank()
                ? Map.of() : objectMapper.readValue(body, Map.class);
            return parsed;
        } catch (Exception e) {
            throw new GithubException("OAuth token endpoint returned a non-JSON response", 502);
        }
    }

    private static String safeError(String body) {
        return body == null || body.isBlank() ? "empty response body" : "see token endpoint logs";
    }

    private static String encodeForm(Map<String, Object> form) {
        StringBuilder query = new StringBuilder();
        form.forEach((key, value) -> {
            if (query.length() > 0) {
                query.append('&');
            }
            query.append(urlEncode(key)).append('=').append(urlEncode(String.valueOf(value)));
        });
        return query.toString();
    }

    /**
     * Appends camel-http component options to an endpoint URI, separating them
     * from any existing query string with {@code &} (not {@code ?}).
     */
    private static String appendComponentOptions(String uri, String options) {
        return uri + (uri.contains("?") ? "&" : "?") + options;
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private String authToken(AuthConfiguration auth) {
        String configured = firstNonBlank(auth.tokenUrl(), env("github.auth.token-url"));
        return configured != null ? configured : DEFAULT_TOKEN_URL;
    }

    private String cacheKey(AuthConfiguration auth) {
        return (auth.clientId() == null ? "" : auth.clientId())
            + "|" + authToken(auth) + "|" + (auth.scopes() == null ? "" : auth.scopes());
    }

    private String required(String value, String envValue, String label) {
        String resolved = firstNonBlank(value, envValue);
        if (resolved == null) {
            throw new GithubException("Missing OAuth credential: " + label, 401);
        }
        return resolved;
    }

    private String env(String key) {
        return environment != null ? environment.getProperty(key) : null;
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
