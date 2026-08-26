package camel.harness.core;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Standard typed authentication block. Use this instead of putting secrets in the URI.
 * The exact fields consumed depend on the connector family (see CONNECTORS.md).
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record AuthConfiguration(
        @JsonProperty("type") String type,
        @JsonProperty("username") String username,
        @JsonProperty("password") String password,
        @JsonProperty("token") String token,
        @JsonProperty("accessKey") String accessKey,
        @JsonProperty("secretKey") String secretKey,
        @JsonProperty("clientId") String clientId,
        @JsonProperty("clientSecret") String clientSecret,
        @JsonProperty("apiKey") String apiKey,
        @JsonProperty("apiKeyHeader") String apiKeyHeader,
        @JsonProperty("region") String region,
        @JsonProperty("tenantId") String tenantId,
        @JsonProperty("subscriptionId") String subscriptionId,
        @JsonProperty("projectId") String projectId,
        @JsonProperty("refreshToken") String refreshToken,
        @JsonProperty("authorizationUrl") String authorizationUrl,
        @JsonProperty("tokenUrl") String tokenUrl,
        @JsonProperty("scopes") String scopes,
        @JsonProperty("properties") Map<String, String> properties,
        @JsonProperty("authorizationCode") String authorizationCode,
        @JsonProperty("redirectUri") String redirectUri,
        @JsonProperty("deviceCode") String deviceCode,
        @JsonProperty("assertion") String assertion) {

    /**
     * Backward-compatible constructor for the original 19-field shape. The four
     * new OAuth fields ({@code authorizationCode}, {@code redirectUri},
     * {@code deviceCode}, {@code assertion}) default to {@code null}.
     */
    public AuthConfiguration(String type, String username, String password, String token,
            String accessKey, String secretKey, String clientId, String clientSecret,
            String apiKey, String apiKeyHeader, String region, String tenantId,
            String subscriptionId, String projectId, String refreshToken,
            String authorizationUrl, String tokenUrl, String scopes,
            Map<String, String> properties) {
        this(type, username, password, token, accessKey, secretKey, clientId, clientSecret,
            apiKey, apiKeyHeader, region, tenantId, subscriptionId, projectId, refreshToken,
            authorizationUrl, tokenUrl, scopes, properties, null, null, null, null);
    }

    public AuthType authType() {
        if (type == null || type.isBlank()) {
            return AuthType.NONE;
        }
        return AuthType.fromString(type);
    }

    /**
     * OAuth grant style hint, read from {@code auth.type} ({@code oauth2} or
     * {@code client_credentials}). OAuth2 defaults to the authorization-code flow
     * when a refreshToken is present, otherwise falls back to client-credentials.
     */
    public boolean isOAuth2() {
        return authType() == AuthType.OAUTH2;
    }
}
