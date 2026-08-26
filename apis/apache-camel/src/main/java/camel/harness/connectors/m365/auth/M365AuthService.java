package camel.harness.connectors.m365.auth;

import camel.harness.connectors.m365.M365Defaults;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.connectors.m365.util.M365SecretSanitizer;
import camel.harness.core.AuthConfiguration;
import camel.harness.core.AuthType;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.camel.Exchange;
import org.apache.camel.ProducerTemplate;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import camel.harness.core.AuthConfiguration;
import camel.harness.core.AuthType;

/**
 * Central authentication layer for all M365 / Microsoft Graph connector routes.
 * Every action delegates here; no per-route auth logic exists anywhere else.
 *
 * <p>Supported {@code auth.type} values:</p>
 * <ul>
 *   <li>{@code accessToken} / {@code bearer} — {@code Authorization: Bearer <token>}
 *       from a pre-generated Microsoft Graph token ({@code auth.token}).</li>
 *   <li>{@code oauth2} — authorization-code flow: acquires/refreshes an access
 *       token from the Entra token endpoint using {@code clientId/clientSecret}
 *       plus {@code refreshToken}, cached in {@link M365TokenCache}.</li>
 *   <li>{@code authorization_code} — OAuth 2.0 authorization-code grant: exchanges
 *       {@code authorizationCode} + {@code redirectUri} for an access token.</li>
 *   <li>{@code refresh_token} — OAuth 2.0 refresh-token grant: exchanges
 *       {@code refreshToken} for a fresh access token.</li>
 *   <li>{@code device_code} — OAuth 2.0 device-code flow: starts a device
 *       authorization request and polls the token endpoint until the user
 *       completes sign-in on another device.</li>
 *   <li>{@code on_behalf_of} — OAuth 2.0 On-Behalf-Of (OBO) flow: exchanges a
 *       caller {@code assertion} (JWT) for a downstream Graph token.</li>
 *   <li>{@code client_credentials} — app-only flow against the Entra token
 *       endpoint using {@code tenantId/clientId/clientSecret}, cached.</li>
 *   <li>{@code apiKey} — only supported against an optional API-key gateway
 *       proxy (sent via {@code apiKeyHeader}); Microsoft Graph itself does not
 *       accept API keys.</li>
 * </ul>
 *
 * <p>Credentials may also be supplied through application properties/environment
 * (e.g. {@code m365.auth.token}, {@code m365.auth.client-id},
 * {@code m365.auth.tenant-id}) so nothing is ever hard-coded. Secrets are never
 * included in exceptions or logs.</p>
 */
@Component
public class M365AuthService {

    private static final String GRAPH_ACCEPT = "application/json";

    private final ProducerTemplate producerTemplate;
    private final ObjectMapper objectMapper;
    private final M365TokenCache tokenCache;
    private final Environment environment;

    public M365AuthService(ProducerTemplate producerTemplate, ObjectMapper objectMapper,
            M365TokenCache tokenCache, Environment environment) {
        this.producerTemplate = producerTemplate;
        this.objectMapper = objectMapper;
        this.tokenCache = tokenCache;
        this.environment = environment;
    }

    /**
     * Returns the authorization headers to attach to a Microsoft Graph request for
     * the given auth configuration, or an empty map for unauthenticated calls.
     * Never logs or echoes secrets.
     */
    public Map<String, String> authorizationHeaders(AuthConfiguration auth) {
        Map<String, String> headers = new LinkedHashMap<>();
        headers.put("Accept", GRAPH_ACCEPT);
        if (auth == null || auth.authType() == AuthType.NONE) {
            return headers;
        }
        switch (auth.authType()) {
            case BEARER, ACCESS_TOKEN -> {
                String token = firstNonBlank(auth.token(), env("m365.auth.token"));
                if (token != null) {
                    headers.put("Authorization", "Bearer " + token);
                }
            }
            case OAUTH2, AUTHORIZATION_CODE, REFRESH_TOKEN, DEVICE_CODE, ON_BEHALF_OF -> {
                String token = resolveOAuthToken(auth);
                if (token != null) {
                    headers.put("Authorization", "Bearer " + token);
                }
            }
            case CLIENT_CREDENTIALS -> {
                String token = clientCredentials(auth);
                if (token != null) {
                    headers.put("Authorization", "Bearer " + token);
                }
            }
            case API_KEY -> {
                // Optional gateway proxy only — Microsoft Graph does not support API keys.
                String key = firstNonBlank(auth.apiKey(), env("m365.auth.api-key"));
                if (key != null) {
                    String header = firstNonBlank(auth.apiKeyHeader(), env("m365.auth.api-key-header"), "X-Api-Key");
                    headers.put(header, key);
                }
            }
            default -> {
                // Unsupported auth type for M365; leave unauthenticated. A missing
                // credential produces a safe validation error downstream.
            }
        }
        return headers;
    }

    /**
     * Returns the effective access token for the configured OAuth flow, acquiring
     * or refreshing from the Entra ID token endpoint when a cached token is absent
     * or expired. Dispatches on {@code auth.type}:
     * <ul>
     *   <li>{@code oauth2} — refresh-token grant when a refreshToken is present,
     *       otherwise falls back to client_credentials.</li>
     *   <li>{@code authorization_code} — exchanges the authorization code.</li>
     *   <li>{@code refresh_token} — exchanges the refresh token.</li>
     *   <li>{@code device_code} — starts/polls the device-code flow.</li>
     *   <li>{@code on_behalf_of} — exchanges the caller assertion (OBO).</li>
     * </ul>
     */
    public String resolveOAuthToken(AuthConfiguration auth) {
        String key = cacheKey(auth);
        String cached = tokenCache.accessToken(key);
        if (cached != null) {
            return cached;
        }
        return switch (auth.authType()) {
            case AUTHORIZATION_CODE -> authorizationCode(auth, key);
            case REFRESH_TOKEN -> {
                String refreshToken = firstNonBlank(auth.refreshToken(), env("m365.auth.refresh-token"));
                if (refreshToken == null) {
                    throw new M365Exception(
                        "refresh_token flow requires auth.refreshToken (or m365.auth.refresh-token)", 400);
                }
                yield exchangeToken(auth, key, refreshToken);
            }
            case DEVICE_CODE -> deviceCode(auth, key);
            case ON_BEHALF_OF -> onBehalfOf(auth, key);
            default -> {
                // oauth2 (and any other delegated style): prefer refresh token,
                // otherwise fall back to app-only client credentials.
                String refreshToken = firstNonBlank(auth.refreshToken(), env("m365.auth.refresh-token"));
                if (refreshToken != null) {
                    yield exchangeToken(auth, key, refreshToken);
                }
                yield clientCredentials(auth);
            }
        };
    }

    /** Invalidates the cached OAuth token, e.g. after a 401 from Graph. */
    public void invalidate(AuthConfiguration auth) {
        if (auth != null && (auth.authType() == AuthType.OAUTH2
                || auth.authType() == AuthType.CLIENT_CREDENTIALS
                || auth.authType() == AuthType.AUTHORIZATION_CODE
                || auth.authType() == AuthType.REFRESH_TOKEN
                || auth.authType() == AuthType.DEVICE_CODE
                || auth.authType() == AuthType.ON_BEHALF_OF)) {
            tokenCache.invalidate(cacheKey(auth));
        }
    }

    // ---------------------------------------------------------------------
    // OAuth token endpoint exchange (Microsoft Entra ID / v2.0)
    // ---------------------------------------------------------------------

    private String clientCredentials(AuthConfiguration auth) {
        return asString(clientCredentialsToken(auth).get("access_token"));
    }

    /**
     * Acquires an app-only Microsoft Graph access token via the OAuth 2.0
     * {@code client_credentials} grant and returns the complete token response
     * ({@code access_token}, {@code token_type}, {@code expires_in},
     * {@code scope}). No user identity is involved.
     *
     * <p>The token is cached; calls within the token's lifetime return the cached
     * value with {@code cached: true}. The returned map never contains the client
     * secret.</p>
     */
    public Map<String, Object> clientCredentialsToken(AuthConfiguration auth) {
        String key = cacheKey(auth);
        String cached = tokenCache.accessToken(key);
        if (cached != null) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("access_token", cached);
            result.put("token_type", "Bearer");
            result.put("cached", true);
            return result;
        }
        Map<String, Object> form = new LinkedHashMap<>();
        form.put("grant_type", "client_credentials");
        form.put("client_id", required(auth.clientId(), env("m365.auth.client-id"), "OAuth clientId"));
        form.put("client_secret", required(auth.clientSecret(), env("m365.auth.client-secret"), "OAuth clientSecret"));
        form.put("scope", firstNonBlank(auth.scopes(), env("m365.auth.scopes"), "https://graph.microsoft.com/.default"));
        Map<String, Object> response = postForm(tokenUrl(auth), form, auth);
        putAccessToken(response, auth, key, null);
        Map<String, Object> result = new LinkedHashMap<>(response);
        result.put("cached", false);
        return result;
    }

    private String exchangeToken(AuthConfiguration auth, String key, String refreshToken) {
        Map<String, Object> form = new LinkedHashMap<>();
        form.put("grant_type", "refresh_token");
        form.put("client_id", required(auth.clientId(), env("m365.auth.client-id"), "OAuth clientId"));
        form.put("client_secret", required(auth.clientSecret(), env("m365.auth.client-secret"), "OAuth clientSecret"));
        form.put("refresh_token", refreshToken);
        String scope = delegatedScope(auth);
        if (scope != null) {
            form.put("scope", scope);
        }
        Map<String, Object> response = postForm(tokenUrl(auth), form, auth);
        return putAccessToken(response, auth, key, refreshToken);
    }

    /**
     * OAuth 2.0 authorization-code grant: exchanges {@code authorizationCode} and
     * {@code redirectUri} for an access token (and refresh token) from the Entra
     * token endpoint. The returned map never contains the client secret.
     */
    public Map<String, Object> authorizationCodeToken(AuthConfiguration auth) {
        String key = cacheKey(auth);
        String cached = tokenCache.accessToken(key);
        if (cached != null) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("access_token", cached);
            result.put("token_type", "Bearer");
            result.put("cached", true);
            return result;
        }
        String code = firstNonBlank(auth.authorizationCode(), env("m365.auth.authorization-code"));
        if (code == null) {
            throw new M365Exception(
                "authorization_code flow requires auth.authorizationCode (or m365.auth.authorization-code)", 400);
        }
        Map<String, Object> form = new LinkedHashMap<>();
        form.put("grant_type", "authorization_code");
        form.put("client_id", required(auth.clientId(), env("m365.auth.client-id"), "OAuth clientId"));
        form.put("client_secret", required(auth.clientSecret(), env("m365.auth.client-secret"), "OAuth clientSecret"));
        form.put("code", code);
        form.put("redirect_uri", firstNonBlank(auth.redirectUri(), env("m365.auth.redirect-uri")));
        String scope = delegatedScope(auth);
        if (scope != null) {
            form.put("scope", scope);
        }
        Map<String, Object> response = postForm(tokenUrl(auth), form, auth);
        putAccessToken(response, auth, key, null);
        Map<String, Object> result = new LinkedHashMap<>(response);
        result.put("cached", false);
        return result;
    }

    private String authorizationCode(AuthConfiguration auth, String key) {
        return asString(authorizationCodeToken(auth).get("access_token"));
    }

    /**
     * OAuth 2.0 refresh-token grant: exchanges {@code refreshToken} for a fresh
     * access token. Returns the complete token response (never the client secret).
     */
    public Map<String, Object> refreshTokenToken(AuthConfiguration auth) {
        String key = cacheKey(auth);
        String cached = tokenCache.accessToken(key);
        if (cached != null) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("access_token", cached);
            result.put("token_type", "Bearer");
            result.put("cached", true);
            return result;
        }
        String refreshToken = firstNonBlank(auth.refreshToken(), env("m365.auth.refresh-token"));
        if (refreshToken == null) {
            throw new M365Exception(
                "refresh_token flow requires auth.refreshToken (or m365.auth.refresh-token)", 400);
        }
        Map<String, Object> response = postForm(tokenUrl(auth), refreshForm(auth, refreshToken), auth);
        putAccessToken(response, auth, key, refreshToken);
        Map<String, Object> result = new LinkedHashMap<>(response);
        result.put("cached", false);
        return result;
    }

    private Map<String, Object> refreshForm(AuthConfiguration auth, String refreshToken) {
        Map<String, Object> form = new LinkedHashMap<>();
        form.put("grant_type", "refresh_token");
        form.put("client_id", required(auth.clientId(), env("m365.auth.client-id"), "OAuth clientId"));
        form.put("client_secret", required(auth.clientSecret(), env("m365.auth.client-secret"), "OAuth clientSecret"));
        form.put("refresh_token", refreshToken);
        String scope = delegatedScope(auth);
        if (scope != null) {
            form.put("scope", scope);
        }
        return form;
    }

    /**
     * Resolves the {@code scope} parameter for a delegated (user) OAuth flow.
     * The {@code .default} sentinel is only valid for the app-only
     * {@code client_credentials} grant — sending it in a delegated
     * {@code refresh_token}/{@code authorization_code}/{@code device_code}/OBO
     * request makes Entra ID reject it with {@code AADSTS90013}. When the
     * configured scope is exactly {@code .default} (or empty), the scope
     * parameter is omitted entirely so Entra reuses the scopes originally
     * granted to the refresh token.
     *
     * @return the cleaned scope string, or {@code null} to omit the parameter
     */
    private String delegatedScope(AuthConfiguration auth) {
        String scope = firstNonBlank(auth.scopes(), env("m365.auth.scopes"));
        if (scope == null || scope.isBlank()) {
            return null;
        }
        String trimmed = scope.trim();
        if (trimmed.equalsIgnoreCase(".default")
            || trimmed.endsWith("/.default")
            || trimmed.equalsIgnoreCase("https://graph.microsoft.com/.default")) {
            return null;
        }
        return trimmed;
    }

    /**
     * OAuth 2.0 device-code flow: starts a device authorization request against
     * the Entra device endpoint and returns the {@code device_code},
     * {@code user_code}, {@code verification_uri} and polling interval so the
     * caller can prompt the user to sign in on another device. The caller then
     * polls {@link #deviceCodeToken(AuthConfiguration)} until the token is issued.
     */
    public Map<String, Object> deviceCodeStart(AuthConfiguration auth) {
        String deviceUrl = deviceCodeUrl(auth);
        Map<String, Object> form = new LinkedHashMap<>();
        form.put("client_id", required(auth.clientId(), env("m365.auth.client-id"), "OAuth clientId"));
        String scope = delegatedScope(auth);
        if (scope != null) {
            form.put("scope", scope);
        }
        Map<String, Object> response = postForm(deviceUrl, form, auth);
        Map<String, Object> result = new LinkedHashMap<>(response);
        result.put("grant", "device_code");
        return result;
    }

    /**
     * Polls the token endpoint for a device-code flow. Returns the token response
     * when the user has completed sign-in, or throws a sanitized M365Exception
     * (e.g. {@code authorization_pending}) when the user has not yet finished.
     */
    public Map<String, Object> deviceCodeToken(AuthConfiguration auth) {
        String key = cacheKey(auth);
        String cached = tokenCache.accessToken(key);
        if (cached != null) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("access_token", cached);
            result.put("token_type", "Bearer");
            result.put("cached", true);
            return result;
        }
        String deviceCode = firstNonBlank(auth.deviceCode(), env("m365.auth.device-code"));
        if (deviceCode == null) {
            throw new M365Exception(
                "device_code flow requires auth.deviceCode (or m365.auth.device-code); call auth.device-code-start first", 400);
        }
        Map<String, Object> form = new LinkedHashMap<>();
        form.put("grant_type", "urn:ietf:params:oauth:grant-type:device_code");
        form.put("client_id", required(auth.clientId(), env("m365.auth.client-id"), "OAuth clientId"));
        form.put("device_code", deviceCode);
        Map<String, Object> response = postForm(tokenUrl(auth), form, auth);
        putAccessToken(response, auth, key, null);
        Map<String, Object> result = new LinkedHashMap<>(response);
        result.put("cached", false);
        return result;
    }

    private String deviceCode(AuthConfiguration auth, String key) {
        return asString(deviceCodeToken(auth).get("access_token"));
    }

    /**
     * OAuth 2.0 On-Behalf-Of (OBO) flow: exchanges a caller {@code assertion}
     * (a JWT from the upstream service) for a downstream Microsoft Graph access
     * token. Returns the complete token response (never the client secret).
     */
    public Map<String, Object> onBehalfOfToken(AuthConfiguration auth) {
        String key = cacheKey(auth);
        String cached = tokenCache.accessToken(key);
        if (cached != null) {
            Map<String, Object> result = new LinkedHashMap<>();
            result.put("access_token", cached);
            result.put("token_type", "Bearer");
            result.put("cached", true);
            return result;
        }
        String assertion = firstNonBlank(auth.assertion(), env("m365.auth.assertion"));
        if (assertion == null) {
            throw new M365Exception(
                "on_behalf_of flow requires auth.assertion (or m365.auth.assertion)", 400);
        }
        Map<String, Object> form = new LinkedHashMap<>();
        form.put("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");
        form.put("client_id", required(auth.clientId(), env("m365.auth.client-id"), "OAuth clientId"));
        form.put("client_secret", required(auth.clientSecret(), env("m365.auth.client-secret"), "OAuth clientSecret"));
        form.put("assertion", assertion);
        form.put("requested_token_use", "on_behalf_of");
        String scope = delegatedScope(auth);
        if (scope != null) {
            form.put("scope", scope);
        }
        Map<String, Object> response = postForm(tokenUrl(auth), form, auth);
        putAccessToken(response, auth, key, null);
        Map<String, Object> result = new LinkedHashMap<>(response);
        result.put("cached", false);
        return result;
    }

    private String onBehalfOf(AuthConfiguration auth, String key) {
        return asString(onBehalfOfToken(auth).get("access_token"));
    }

    private String putAccessToken(Map<String, Object> response, AuthConfiguration auth, String key,
            String refreshToken) {
        String accessToken = asString(response.get("access_token"));
        if (accessToken == null || accessToken.isBlank()) {
            throw new M365Exception("OAuth token exchange did not return an access_token", 401);
        }
        Object expiresIn = response.get("expires_in");
        Long expires = expiresIn instanceof Number n ? n.longValue() : null;
        String newRefresh = asString(response.get("refresh_token"));
        tokenCache.put(key, accessToken, newRefresh != null ? newRefresh : refreshToken, expires);
        return accessToken;
    }

    private Map<String, Object> postForm(String url, Map<String, Object> form, AuthConfiguration auth) {
        // throwExceptionOnFailure=false so 4xx/5xx responses return as exchanges
        // and can be classified into a sanitized M365Exception below. Use '&' to
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
            throw new M365Exception(
                "OAuth token endpoint returned HTTP " + status + ": " + safeError(body, auth), status);
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = body == null || body.isBlank()
                ? Map.of() : objectMapper.readValue(body, Map.class);
            return parsed;
        } catch (Exception e) {
            throw new M365Exception("OAuth token endpoint returned a non-JSON response", 502);
        }
    }

    private static String safeError(String body, AuthConfiguration auth) {
        if (body == null || body.isBlank()) {
            return "empty response body";
        }
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> parsed = new ObjectMapper().readValue(body, Map.class);
            Object error = parsed.get("error_description");
            if (error == null) {
                error = parsed.get("error");
            }
            return M365SecretSanitizer.sanitize(error != null ? String.valueOf(error) : "see token endpoint logs");
        } catch (Exception e) {
            return M365SecretSanitizer.sanitize("see token endpoint logs");
        }
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

    private String tokenUrl(AuthConfiguration auth) {
        String tenantId = firstNonBlank(auth.tenantId(), env("m365.auth.tenant-id"));
        String template = firstNonBlank(auth.tokenUrl(), env("m365.auth.token-url"),
            M365Defaults.tokenUrl(environment));
        return template.replace("{tenantId}", tenantId != null ? tenantId : "common");
    }

    /**
     * Device-authorization endpoint for the device-code flow. Derived from the
     * token URL by replacing the trailing {@code /token} segment with
     * {@code /devicecode}, or overridable via {@code m365.auth.device-url}.
     */
    private String deviceCodeUrl(AuthConfiguration auth) {
        String configured = firstNonBlank(env("m365.auth.device-url"));
        if (configured != null) {
            return configured;
        }
        String token = tokenUrl(auth);
        if (token.endsWith("/token")) {
            return token.substring(0, token.length() - "/token".length()) + "/devicecode";
        }
        return token;
    }

    private String cacheKey(AuthConfiguration auth) {
        return (auth.tenantId() == null ? "" : auth.tenantId())
            + "|" + (auth.clientId() == null ? "" : auth.clientId())
            + "|" + tokenUrl(auth)
            + "|" + (auth.scopes() == null ? "" : auth.scopes());
    }

    private String required(String value, String envValue, String label) {
        String resolved = firstNonBlank(value, envValue);
        if (resolved == null) {
            throw new M365Exception("Missing M365 credential: " + label, 401);
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

    private static String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}
