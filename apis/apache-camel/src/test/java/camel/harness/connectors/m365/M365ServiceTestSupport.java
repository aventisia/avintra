package camel.harness.connectors.m365;

import static org.mockito.Mockito.mock;

import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.springframework.core.env.Environment;

import camel.harness.connectors.m365.client.M365Client;
import camel.harness.connectors.m365.client.M365DispatchProcessor;
import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;

/**
 * Shared support for focused per-service/action M365 tests. Service tests in
 * sub-packages extend this to resolve {@code direct:m365.<service>.<action>}
 * routes and to build a {@link M365DispatchProcessor} with a mocked client so
 * request building (paths, query params, pagination) can be asserted per action.
 */
public abstract class M365ServiceTestSupport {

    protected final M365Actions actions = new M365Actions();
    protected final Environment environment = mock(Environment.class);
    protected final M365Configurer configurer = new M365Configurer(actions, environment);

    /**
     * Resolves the {@code direct:...} route for the given dotted operation with a
     * minimal configuration (the configurer only needs the operation name).
     */
    protected String resolveRoute(String operation) {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = new ConnectorRequest(null, null, "m365", operation,
            Map.of(), null, null, null, null, null);
        return configurer.resolveEndpoint(exchange, request, null);
    }

    /**
     * Builds a dispatcher backed by a mocked {@link M365Client} so callers can
     * assert prepared requests without an HTTP round trip.
     */
    protected M365DispatchProcessor dispatcher() {
        return new M365DispatchProcessor(mock(M365Client.class), mock(Environment.class));
    }

    protected Map<String, Object> config(Object... keyValues) {
        return configMap(keyValues);
    }

    /** Builds a configuration map from alternating key/value pairs. */
    public static Map<String, Object> configMap(Object... keyValues) {
        Map<String, Object> config = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            config.put((String) keyValues[i], keyValues[i + 1]);
        }
        return config;
    }

    /** Builds an accessToken auth block from a pre-generated Graph bearer token. */
    public static AuthConfiguration accessToken(String token) {
        return new AuthConfiguration("accessToken", null, null, token, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    /** Builds an oauth2 (client credentials) auth block for Entra ID flows. */
    public static AuthConfiguration oauth2(String tenantId, String clientId, String clientSecret) {
        return new AuthConfiguration("oauth2", null, null, null, null, null,
            clientId, clientSecret, null, null, null, tenantId, null, null, null, null, null, null, null);
    }

    /** Builds a client_credentials auth block for app-only access. */
    public static AuthConfiguration clientCredentials(String tenantId, String clientId, String clientSecret) {
        return new AuthConfiguration("client_credentials", null, null, null, null, null,
            clientId, clientSecret, null, null, null, tenantId, null, null, null, null, null, null, null);
    }

    /** Builds an authorization_code auth block for the OAuth 2.0 auth-code grant. */
    public static AuthConfiguration authorizationCode(String tenantId, String clientId, String clientSecret,
            String code, String redirectUri) {
        return new AuthConfiguration("authorization_code", null, null, null, null, null,
            clientId, clientSecret, null, null, null, tenantId, null, null, null, null, null, null, null,
            code, redirectUri, null, null);
    }

    /** Builds a refresh_token auth block for the OAuth 2.0 refresh-token grant. */
    public static AuthConfiguration refreshToken(String tenantId, String clientId, String clientSecret,
            String refreshToken) {
        return new AuthConfiguration("refresh_token", null, null, null, null, null,
            clientId, clientSecret, null, null, null, tenantId, null, null, refreshToken, null,
            null, null, null, null, null, null, null);
    }

    /** Builds a device_code auth block for the OAuth 2.0 device-code flow. */
    public static AuthConfiguration deviceCode(String tenantId, String clientId, String clientSecret,
            String deviceCode) {
        return new AuthConfiguration("device_code", null, null, null, null, null,
            clientId, clientSecret, null, null, null, tenantId, null, null, null, null, null, null, null,
            null, null, deviceCode, null);
    }

    /** Builds an on_behalf_of auth block for the OAuth 2.0 OBO flow. */
    public static AuthConfiguration onBehalfOf(String tenantId, String clientId, String clientSecret,
            String assertion) {
        return new AuthConfiguration("on_behalf_of", null, null, null, null, null,
            clientId, clientSecret, null, null, null, tenantId, null, null, null, null, null, null, null,
            null, null, null, assertion);
    }
}
