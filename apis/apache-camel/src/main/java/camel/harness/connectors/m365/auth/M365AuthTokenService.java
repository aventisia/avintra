package camel.harness.connectors.m365.auth;

import camel.harness.connectors.m365.M365Configurer;
import camel.harness.connectors.m365.error.M365Exception;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import camel.harness.core.AuthConfiguration;
import camel.harness.core.AuthType;
import camel.harness.core.ConnectorRequest;

/**
 * Domain service for the {@code auth} service family. Exposes the Microsoft
 * Entra ID token endpoints directly as connector operations so callers can
 * obtain a Microsoft Graph access token through every supported OAuth 2.0 flow:
 *
 * <ul>
 *   <li>{@code auth.get-token} — app-only {@code client_credentials} grant
 *       (no user identity required).</li>
 *   <li>{@code auth.authorization-code} — OAuth 2.0 authorization-code grant
 *       (exchanges {@code authorizationCode} + {@code redirectUri}).</li>
 *   <li>{@code auth.refresh-token} — OAuth 2.0 refresh-token grant.</li>
 *   <li>{@code auth.device-code-start} — starts the device-code flow and returns
 *       the {@code user_code}/{@code verification_uri} for the user to sign in.</li>
 *   <li>{@code auth.device-code-poll} — polls the token endpoint until the user
 *       completes sign-in (or returns {@code authorization_pending}).</li>
 *   <li>{@code auth.on-behalf-of} — OAuth 2.0 On-Behalf-Of (OBO) flow, exchanging
 *       a caller {@code assertion} for a downstream Graph token.</li>
 * </ul>
 *
 * <p>Credentials are read from the request {@code auth} block (preferred) or from
 * {@code configuration} ({@code tenantId}/{@code clientId}/{@code clientSecret}),
 * falling back to environment properties ({@code m365.auth.tenant-id}, etc.).
 * The token is returned in the response envelope only — never logged, never
 * echoed in errors. The client secret is never included in the response.</p>
 */
@Component("auth")
public class M365AuthTokenService {

    private final M365AuthService authService;
    private final Environment environment;

    public M365AuthTokenService(M365AuthService authService, Environment environment) {
        this.authService = authService;
        this.environment = environment;
    }

    /**
     * Obtains an app-only access token via the {@code client_credentials} grant.
     * Credentials may come from {@code auth} ({@code client_credentials} or
     * {@code oauth2}), from {@code configuration}, or from environment properties.
     */
    public Object getToken(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request != null ? request.configurationOrEmpty() : Map.of();
        AuthConfiguration auth = resolveAuth(request, config, "client_credentials");

        Map<String, Object> response = authService.clientCredentialsToken(auth);
        return safeTokenResponse(response, "client_credentials");
    }

    /**
     * OAuth 2.0 authorization-code grant: exchanges {@code authorizationCode} and
     * {@code redirectUri} for an access token (and refresh token).
     */
    public Object authorizationCode(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request != null ? request.configurationOrEmpty() : Map.of();
        AuthConfiguration auth = resolveAuth(request, config, "authorization_code");

        Map<String, Object> response = authService.authorizationCodeToken(auth);
        return safeTokenResponse(response, "authorization_code");
    }

    /**
     * OAuth 2.0 refresh-token grant: exchanges {@code refreshToken} for a fresh
     * access token.
     */
    public Object refreshToken(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request != null ? request.configurationOrEmpty() : Map.of();
        AuthConfiguration auth = resolveAuth(request, config, "refresh_token");

        Map<String, Object> response = authService.refreshTokenToken(auth);
        return safeTokenResponse(response, "refresh_token");
    }

    /**
     * Starts the OAuth 2.0 device-code flow. Returns the {@code device_code},
     * {@code user_code}, {@code verification_uri} and {@code interval} so the
     * caller can prompt the user to sign in on another device, then poll with
     * {@code auth.device-code-poll}.
     */
    public Object deviceCodeStart(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request != null ? request.configurationOrEmpty() : Map.of();
        AuthConfiguration auth = resolveAuth(request, config, "device_code");

        Map<String, Object> response = authService.deviceCodeStart(auth);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("device_code", response.get("device_code"));
        result.put("user_code", response.get("user_code"));
        result.put("verification_uri", response.get("verification_uri"));
        result.put("verification_uri_complete", response.get("verification_uri_complete"));
        result.put("expires_in", response.get("expires_in"));
        result.put("interval", response.get("interval"));
        result.put("message", response.get("message"));
        result.put("grant", "device_code");
        return result;
    }

    /**
     * Polls the token endpoint for a device-code flow. When the user has not yet
     * completed sign-in, the token endpoint returns {@code authorization_pending}
     * and this operation surfaces a sanitized M365Exception with that code so the
     * caller can retry after {@code interval} seconds.
     */
    public Object deviceCodePoll(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request != null ? request.configurationOrEmpty() : Map.of();
        AuthConfiguration auth = resolveAuth(request, config, "device_code");

        Map<String, Object> response = authService.deviceCodeToken(auth);
        return safeTokenResponse(response, "device_code");
    }

    /**
     * OAuth 2.0 On-Behalf-Of (OBO) flow: exchanges a caller {@code assertion}
     * (JWT) for a downstream Microsoft Graph access token.
     */
    public Object onBehalfOf(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request != null ? request.configurationOrEmpty() : Map.of();
        AuthConfiguration auth = resolveAuth(request, config, "on_behalf_of");

        Map<String, Object> response = authService.onBehalfOfToken(auth);
        return safeTokenResponse(response, "on_behalf_of");
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    /** Never echo any secret; return only the safe token fields. */
    private static Map<String, Object> safeTokenResponse(Map<String, Object> response, String grant) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("access_token", response.get("access_token"));
        result.put("token_type", response.get("token_type"));
        if (response.get("expires_in") != null) {
            result.put("expires_in", response.get("expires_in"));
        }
        if (response.get("scope") != null) {
            result.put("scope", response.get("scope"));
        }
        if (response.get("refresh_token") != null) {
            result.put("refresh_token", response.get("refresh_token"));
        }
        result.put("cached", response.get("cached"));
        result.put("grant", grant);
        return result;
    }

    /**
     * Resolves the auth block used for the token exchange. Prefers the request
     * {@code auth} block when it carries client credentials; otherwise builds one
     * from {@code configuration} (or environment defaults).
     */
    private AuthConfiguration resolveAuth(ConnectorRequest request, Map<String, Object> config,
            String defaultType) {
        AuthConfiguration auth = request != null ? request.auth() : null;
        if (auth != null && (auth.authType() == AuthType.CLIENT_CREDENTIALS
                || auth.authType() == AuthType.OAUTH2
                || auth.authType() == AuthType.AUTHORIZATION_CODE
                || auth.authType() == AuthType.REFRESH_TOKEN
                || auth.authType() == AuthType.DEVICE_CODE
                || auth.authType() == AuthType.ON_BEHALF_OF)) {
            // Already carries client credentials; use as-is (env fallbacks apply).
            return auth;
        }

        String tenantId = firstNonBlank(configValue(config, "tenantId"), env("m365.auth.tenant-id"));
        String clientId = firstNonBlank(configValue(config, "clientId"), env("m365.auth.client-id"));
        String clientSecret = firstNonBlank(configValue(config, "clientSecret"), env("m365.auth.client-secret"));
        String scopes = firstNonBlank(configValue(config, "scopes"), env("m365.auth.scopes"));
        String tokenUrl = firstNonBlank(configValue(config, "tokenUrl"), env("m365.auth.token-url"));
        String refreshToken = firstNonBlank(configValue(config, "refreshToken"), env("m365.auth.refresh-token"));
        String authorizationCode = firstNonBlank(configValue(config, "authorizationCode"),
            env("m365.auth.authorization-code"));
        String redirectUri = firstNonBlank(configValue(config, "redirectUri"), env("m365.auth.redirect-uri"));
        String deviceCode = firstNonBlank(configValue(config, "deviceCode"), env("m365.auth.device-code"));
        String assertion = firstNonBlank(configValue(config, "assertion"), env("m365.auth.assertion"));

        if (clientId == null || clientSecret == null) {
            throw new M365Exception(
                "auth operation requires client credentials: provide auth (client_credentials/oauth2/"
                    + "authorization_code/refresh_token/device_code/on_behalf_of) with clientId/clientSecret, "
                    + "or configuration tenantId/clientId/clientSecret",
                400);
        }
        return new AuthConfiguration(defaultType, null, null, null, null, null,
            clientId, clientSecret, null, null, null, tenantId, null, null, refreshToken, null,
            tokenUrl, scopes, null, authorizationCode, redirectUri, deviceCode, assertion);
    }

    private static String configValue(Map<String, Object> config, String key) {
        Object value = config.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private static ConnectorRequest Request(Exchange exchange) {
        return exchange.getProperty(M365Configurer.PROP_REQUEST, ConnectorRequest.class);
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private String env(String key) {
        return environment != null ? environment.getProperty(key) : null;
    }
}
