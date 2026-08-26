package camel.harness.connectors.m365.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.camel.Exchange;
import org.apache.camel.Message;
import org.apache.camel.Processor;
import org.apache.camel.ProducerTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.env.Environment;

import camel.harness.connectors.m365.auth.M365AuthService;
import camel.harness.connectors.m365.auth.M365TokenCache;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.core.AuthConfiguration;

/**
 * Focused tests for {@link M365AuthService}, with emphasis on the public
 * app-only client-credentials token API ({@code clientCredentialsToken}).
 */
class M365AuthServiceTest {

    private ProducerTemplate producerTemplate;
    private M365TokenCache tokenCache;
    private M365AuthService service;

    @BeforeEach
    void setUp() {
        producerTemplate = mock(ProducerTemplate.class);
        tokenCache = new M365TokenCache();
        service = new M365AuthService(producerTemplate, new ObjectMapper(), tokenCache,
            mock(Environment.class));
    }

    @Test
    void clientCredentialsTokenReturnsAccessToken() {
        stubTokenEndpoint("{\"access_token\":\"app_token_1\",\"token_type\":\"Bearer\","
            + "\"expires_in\":3600,\"scope\":\"https://graph.microsoft.com/.default\"}");
        AuthConfiguration auth = client();

        var response = service.clientCredentialsToken(auth);

        assertEquals("app_token_1", response.get("access_token"));
        assertEquals("Bearer", response.get("token_type"));
        assertEquals(3600, ((Number) response.get("expires_in")).intValue());
        assertEquals(false, response.get("cached"));
        assertFalse(response.containsKey("client_secret"));
    }

    @Test
    void clientCredentialsTokenCachesSecondCall() {
        stubTokenEndpoint("{\"access_token\":\"app_token_2\",\"token_type\":\"Bearer\","
            + "\"expires_in\":3600}");
        AuthConfiguration auth = client();

        var first = service.clientCredentialsToken(auth);
        var second = service.clientCredentialsToken(auth);

        assertEquals("app_token_2", first.get("access_token"));
        assertEquals(true, second.get("cached"));
        assertEquals("app_token_2", second.get("access_token"));
    }

    @Test
    void clientCredentialsTokenMissingSecretThrowsSafeError() {
        stubTokenEndpoint("{\"access_token\":\"x\"}");
        AuthConfiguration auth = new AuthConfiguration("client_credentials", null, null, null, null, null,
            "client-123", null, null, null, null, "tenant-1", null, null, null, null, null, null, null);
        M365Exception ex = assertThrows(M365Exception.class, () -> service.clientCredentialsToken(auth));
        assertEquals(401, ex.statusCode());
        assertTrue(ex.getMessage().contains("clientSecret"));
    }

    @Test
    void clientCredentialsTokenFailureThrowsSanitizedError() {
        stubTokenEndpoint("{\"error\":\"invalid_client\",\"error_description\":\"client secret is wrong\"}", 400);
        M365Exception ex = assertThrows(M365Exception.class,
            () -> service.clientCredentialsToken(client()));
        assertEquals(400, ex.statusCode());
        assertTrue(ex.getMessage().contains("token endpoint"));
    }

    @Test
    void authorizationHeadersForClientCredentialsUsesCachedToken() {
        stubTokenEndpoint("{\"access_token\":\"app_token_3\",\"token_type\":\"Bearer\","
            + "\"expires_in\":3600}");
        var headers = service.authorizationHeaders(client());
        assertEquals("Bearer app_token_3", headers.get("Authorization"));
    }

    // ------------------------------------------------------------------
    // Authorization-code flow
    // ------------------------------------------------------------------

    @Test
    void authorizationCodeTokenExchangesCode() {
        stubTokenEndpoint("{\"access_token\":\"authcode_token\",\"token_type\":\"Bearer\","
            + "\"expires_in\":3600,\"refresh_token\":\"new_refresh\"}");
        AuthConfiguration auth = new AuthConfiguration("authorization_code", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "https://graph.microsoft.com/.default", null, "auth-code-1", "http://localhost:8080/callback", null, null);

        var response = service.authorizationCodeToken(auth);

        assertEquals("authcode_token", response.get("access_token"));
        assertEquals(false, response.get("cached"));
        assertFalse(response.containsKey("client_secret"));
    }

    @Test
    void authorizationCodeTokenMissingCodeThrows() {
        stubTokenEndpoint("{\"access_token\":\"x\"}");
        AuthConfiguration auth = new AuthConfiguration("authorization_code", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token", null, null, null, null, null, null);
        M365Exception ex = assertThrows(M365Exception.class, () -> service.authorizationCodeToken(auth));
        assertEquals(400, ex.statusCode());
        assertTrue(ex.getMessage().contains("authorizationCode"));
    }

    // ------------------------------------------------------------------
    // Refresh-token flow
    // ------------------------------------------------------------------

    @Test
    void refreshTokenTokenExchangesRefreshToken() {
        stubTokenEndpoint("{\"access_token\":\"refresh_token_1\",\"token_type\":\"Bearer\","
            + "\"expires_in\":3600}");
        AuthConfiguration auth = new AuthConfiguration("refresh_token", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, "refresh-1", null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "https://graph.microsoft.com/.default", null, null, null, null, null);

        var response = service.refreshTokenToken(auth);

        assertEquals("refresh_token_1", response.get("access_token"));
        assertEquals(false, response.get("cached"));
    }

    @Test
    void refreshTokenTokenMissingRefreshThrows() {
        stubTokenEndpoint("{\"access_token\":\"x\"}");
        AuthConfiguration auth = new AuthConfiguration("refresh_token", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token", null, null, null, null, null, null);
        M365Exception ex = assertThrows(M365Exception.class, () -> service.refreshTokenToken(auth));
        assertEquals(400, ex.statusCode());
        assertTrue(ex.getMessage().contains("refreshToken"));
    }

    // ------------------------------------------------------------------
    // Device-code flow
    // ------------------------------------------------------------------

    @Test
    void deviceCodeStartReturnsUserCode() {
        stubTokenEndpoint("{\"device_code\":\"dev-1\",\"user_code\":\"ABCD-EFGH\","
            + "\"verification_uri\":\"https://microsoft.com/devicelogin\",\"interval\":5}");
        AuthConfiguration auth = new AuthConfiguration("device_code", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "https://graph.microsoft.com/.default", null, null, null, null, null);

        var response = service.deviceCodeStart(auth);

        assertEquals("dev-1", response.get("device_code"));
        assertEquals("ABCD-EFGH", response.get("user_code"));
        assertEquals("https://microsoft.com/devicelogin", response.get("verification_uri"));
    }

    @Test
    void deviceCodeTokenExchangesDeviceCode() {
        stubTokenEndpoint("{\"access_token\":\"device_token\",\"token_type\":\"Bearer\","
            + "\"expires_in\":3600}");
        AuthConfiguration auth = new AuthConfiguration("device_code", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token", null, null, null, null, "dev-1", null);

        var response = service.deviceCodeToken(auth);

        assertEquals("device_token", response.get("access_token"));
        assertEquals(false, response.get("cached"));
    }

    @Test
    void deviceCodeTokenMissingDeviceCodeThrows() {
        stubTokenEndpoint("{\"access_token\":\"x\"}");
        AuthConfiguration auth = new AuthConfiguration("device_code", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token", null, null, null, null, null, null);
        M365Exception ex = assertThrows(M365Exception.class, () -> service.deviceCodeToken(auth));
        assertEquals(400, ex.statusCode());
        assertTrue(ex.getMessage().contains("deviceCode"));
    }

    // ------------------------------------------------------------------
    // On-Behalf-Of (OBO) flow
    // ------------------------------------------------------------------

    @Test
    void onBehalfOfTokenExchangesAssertion() {
        stubTokenEndpoint("{\"access_token\":\"obo_token\",\"token_type\":\"Bearer\","
            + "\"expires_in\":3600}");
        AuthConfiguration auth = new AuthConfiguration("on_behalf_of", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "https://graph.microsoft.com/.default", null, null, null, null, "caller-jwt");

        var response = service.onBehalfOfToken(auth);

        assertEquals("obo_token", response.get("access_token"));
        assertEquals(false, response.get("cached"));
    }

    @Test
    void onBehalfOfTokenMissingAssertionThrows() {
        stubTokenEndpoint("{\"access_token\":\"x\"}");
        AuthConfiguration auth = new AuthConfiguration("on_behalf_of", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token", null, null, null, null, null, null);
        M365Exception ex = assertThrows(M365Exception.class, () -> service.onBehalfOfToken(auth));
        assertEquals(400, ex.statusCode());
        assertTrue(ex.getMessage().contains("assertion"));
    }

    // ------------------------------------------------------------------
    // resolveOAuthToken dispatch
    // ------------------------------------------------------------------

    @Test
    void resolveOAuthTokenDispatchesByAuthType() {
        stubTokenEndpoint("{\"access_token\":\"authcode_token\",\"token_type\":\"Bearer\","
            + "\"expires_in\":3600}");
        AuthConfiguration auth = new AuthConfiguration("authorization_code", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "https://graph.microsoft.com/.default", null, "auth-code-1", "http://localhost:8080/callback", null, null);

        String token = service.resolveOAuthToken(auth);

        assertEquals("authcode_token", token);
    }

    @Test
    void resolveOAuthTokenRefreshFlowUsesRefreshToken() {
        stubTokenEndpoint("{\"access_token\":\"refresh_token_2\",\"token_type\":\"Bearer\","
            + "\"expires_in\":3600}");
        AuthConfiguration auth = new AuthConfiguration("refresh_token", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, "refresh-2", null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "https://graph.microsoft.com/.default", null, null, null, null, null);

        String token = service.resolveOAuthToken(auth);

        assertEquals("refresh_token_2", token);
    }

    // ------------------------------------------------------------------
    // .default scope stripping in delegated flows (AADSTS90013 regression)
    // ------------------------------------------------------------------

    @Test
    void refreshTokenFlowStripsDefaultScope() {
        // The .default sentinel is only valid for client_credentials; sending it
        // in a delegated refresh_token grant makes Entra reject with AADSTS90013.
        String[] capturedBody = new String[1];
        stubTokenEndpointCapturingBody(
            "{\"access_token\":\"refresh_token_3\",\"token_type\":\"Bearer\",\"expires_in\":3600}",
            capturedBody);
        AuthConfiguration auth = new AuthConfiguration("refresh_token", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, "refresh-3", null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "https://graph.microsoft.com/.default", null, null, null, null, null);

        service.refreshTokenToken(auth);

        String body = capturedBody[0];
        assertTrue(body.contains("grant_type=refresh_token"), "body: " + body);
        assertTrue(body.contains("refresh_token=refresh-3"), "body: " + body);
        assertFalse(body.contains("scope="), "delegated flow must not send .default scope, body: " + body);
    }

    @Test
    void refreshTokenFlowKeepsExplicitScopes() {
        String[] capturedBody = new String[1];
        stubTokenEndpointCapturingBody(
            "{\"access_token\":\"refresh_token_4\",\"token_type\":\"Bearer\",\"expires_in\":3600}",
            capturedBody);
        AuthConfiguration auth = new AuthConfiguration("refresh_token", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, "refresh-4", null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "Mail.Read User.Read", null, null, null, null, null);

        service.refreshTokenToken(auth);

        String body = capturedBody[0];
        // URLEncoder encodes spaces as '+'.
        assertTrue(body.contains("scope=Mail.Read+User.Read"), "body: " + body);
    }

    @Test
    void authorizationCodeFlowStripsDefaultScope() {
        String[] capturedBody = new String[1];
        stubTokenEndpointCapturingBody(
            "{\"access_token\":\"authcode_token_2\",\"token_type\":\"Bearer\",\"expires_in\":3600}",
            capturedBody);
        AuthConfiguration auth = new AuthConfiguration("authorization_code", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "https://graph.microsoft.com/.default", null, "code-2", "http://localhost:8080/callback", null, null);

        service.authorizationCodeToken(auth);

        String body = capturedBody[0];
        assertTrue(body.contains("grant_type=authorization_code"), "body: " + body);
        assertFalse(body.contains("scope="), "delegated flow must not send .default scope, body: " + body);
    }

    @Test
    void onBehalfOfFlowStripsDefaultScope() {
        String[] capturedBody = new String[1];
        stubTokenEndpointCapturingBody(
            "{\"access_token\":\"obo_token_2\",\"token_type\":\"Bearer\",\"expires_in\":3600}",
            capturedBody);
        AuthConfiguration auth = new AuthConfiguration("on_behalf_of", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "https://graph.microsoft.com/.default", null, null, null, null, "caller-jwt-2");

        service.onBehalfOfToken(auth);

        String body = capturedBody[0];
        assertTrue(body.contains("grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer"),
            "body: " + body);
        assertFalse(body.contains("scope="), "delegated flow must not send .default scope, body: " + body);
    }

    @Test
    void clientCredentialsKeepsDefaultScope() {
        String[] capturedBody = new String[1];
        stubTokenEndpointCapturingBody(
            "{\"access_token\":\"app_token_4\",\"token_type\":\"Bearer\",\"expires_in\":3600}",
            capturedBody);
        AuthConfiguration auth = new AuthConfiguration("client_credentials", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token",
            "https://graph.microsoft.com/.default", null, null, null, null, null);

        service.clientCredentialsToken(auth);

        String body = capturedBody[0];
        assertTrue(body.contains("scope=https%3A%2F%2Fgraph.microsoft.com%2F.default"),
            "client_credentials must keep .default scope, body: " + body);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private static AuthConfiguration client() {
        return new AuthConfiguration("client_credentials", null, null, null, null, null,
            "client-123", "s3cr3t", null, null, null, "tenant-1", null, null, null, null,
            "https://login.microsoftonline.com/tenant-1/oauth2/v2.0/token", "https://graph.microsoft.com/.default", null);
    }

    private void stubTokenEndpoint(String jsonBody) {
        stubTokenEndpoint(jsonBody, 200);
    }

    private void stubTokenEndpoint(String jsonBody, int status) {
        when(producerTemplate.send(anyString(), any(Processor.class))).thenAnswer(invocation -> {
            Processor processor = invocation.getArgument(1);
            Exchange exchange = mock(Exchange.class);
            Message message = mock(Message.class);
            when(exchange.getMessage()).thenReturn(message);
            when(message.getHeader(Exchange.HTTP_RESPONSE_CODE, 0, Integer.class)).thenReturn(status);
            when(message.getBody(String.class)).thenReturn(jsonBody);
            processor.process(exchange);
            return exchange;
        });
    }

    /** Stubs the token endpoint and captures the form-encoded request body. */
    private void stubTokenEndpointCapturingBody(String jsonBody, String[] capturedBody) {
        when(producerTemplate.send(anyString(), any(Processor.class))).thenAnswer(invocation -> {
            Processor processor = invocation.getArgument(1);
            Exchange exchange = mock(Exchange.class);
            // Use a real message so setBody() actually stores the request form and
            // getHeader() returns the status we set.
            Message message = new org.apache.camel.support.DefaultMessage(
                new org.apache.camel.impl.DefaultCamelContext());
            message.setHeader(Exchange.HTTP_RESPONSE_CODE, 200);
            when(exchange.getMessage()).thenReturn(message);
            processor.process(exchange);
            // Capture the request form body set by the processor.
            capturedBody[0] = message.getBody(String.class);
            // Simulate the token endpoint response body.
            message.setBody(jsonBody);
            return exchange;
        });
    }
}
