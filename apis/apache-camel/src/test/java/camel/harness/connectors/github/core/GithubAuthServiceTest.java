package camel.harness.connectors.github.core;

import camel.harness.connectors.github.auth.GithubAuthService;
import camel.harness.connectors.github.auth.OAuthTokenCache;
import camel.harness.connectors.github.error.GithubException;
import camel.harness.core.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

class GithubAuthServiceTest {

    private ProducerTemplate producerTemplate;
    private OAuthTokenCache tokenCache;
    private GithubAuthService service;

    @BeforeEach
    void setUp() {
        producerTemplate = mock(ProducerTemplate.class);
        tokenCache = new OAuthTokenCache();
        Environment environment = mock(Environment.class);
        service = new GithubAuthService(producerTemplate, new ObjectMapper(), tokenCache, environment);
    }

    // ------------------------------------------------------------------
    // Access token (PAT)
    // ------------------------------------------------------------------

    @Test
    void accessTokenAddsBearerHeader() {
        AuthConfiguration auth = new AuthConfiguration("accessToken", null, null, "ghp_secret_token", null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        java.util.Map<String, String> headers = service.authorizationHeaders(auth);
        assertEquals("Bearer ghp_secret_token", headers.get("Authorization"));
        assertEquals("application/vnd.github+json", headers.get("Accept"));
    }

    @Test
    void bearerAuthAddsBearerHeader() {
        AuthConfiguration auth = new AuthConfiguration("bearer", null, null, "gho_secret", null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        assertEquals("Bearer gho_secret", service.authorizationHeaders(auth).get("Authorization"));
    }

    @Test
    void missingTokenLeavesNoAuthorizationHeader() {
        AuthConfiguration auth = new AuthConfiguration("accessToken", null, null, null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        assertNull(service.authorizationHeaders(auth).get("Authorization"));
    }

    @Test
    void apiKeyDefaultsToBearerHeader() {
        AuthConfiguration auth = new AuthConfiguration("apiKey", null, null, null, null, null,
            null, null, "my-api-key", null, null, null, null, null, null, null, null, null, null);
        assertEquals("Bearer my-api-key", service.authorizationHeaders(auth).get("Authorization"));
    }

    @Test
    void apiKeyWithCustomHeaderUsesIt() {
        AuthConfiguration auth = new AuthConfiguration("apiKey", null, null, null, null, null,
            null, null, "my-api-key", "X-GitHub-Token", null, null, null, null, null, null, null, null, null);
        java.util.Map<String, String> headers = service.authorizationHeaders(auth);
        assertNull(headers.get("Authorization"));
        assertEquals("my-api-key", headers.get("X-GitHub-Token"));
    }

    // ------------------------------------------------------------------
    // OAuth2
    // ------------------------------------------------------------------

    @Test
    void oauthClientCredentialsAcquiresAndCachesToken() {
        String tokenUrl = "https://token.example.com/oauth/token";
        stubTokenEndpoint("{\"access_token\":\"oauth_access_1\",\"token_type\":\"bearer\"}");
        AuthConfiguration auth = new AuthConfiguration("oauth2", null, null, null, null, null,
            "client-123", "client-secret", null, null, null, null, null, null, null, null,
            tokenUrl, "repo,user", null);

        // First call exchanges; second call must reuse the cached token (no second send).
        assertEquals("Bearer oauth_access_1", service.authorizationHeaders(auth).get("Authorization"));
        assertEquals("Bearer oauth_access_1", service.authorizationHeaders(auth).get("Authorization"));
        assertEquals("Bearer oauth_access_1", service.authorizationHeaders(auth).get("Authorization"));
    }

    @Test
    void oauthMissingClientIdProducesSafeError() {
        stubTokenEndpoint("{\"access_token\":\"x\"}");
        AuthConfiguration auth = new AuthConfiguration("oauth2", null, null, null, null, null,
            null, "client-secret", null, null, null, null, null, null, null, null,
            "https://token.example.com", null, null);
        GithubException ex = assertThrows(GithubException.class, () -> service.authorizationHeaders(auth));
        assertEquals(401, ex.statusCode());
        assertTrue(ex.getMessage().contains("clientId"));
        assertTrue(!ex.getMessage().contains("client-secret"));
    }

    @Test
    void oauthTokenEndpointFailureThrowsSanitizedError() {
        stubTokenEndpoint("{\"error\":\"invalid_client\"}", 400);
        AuthConfiguration auth = new AuthConfiguration("oauth2", null, null, null, null, null,
            "client-123", "client-secret", null, null, null, null, null, null, null, null,
            "https://oauth.example.com", null, null);
        GithubException ex = assertThrows(GithubException.class, () -> service.authorizationHeaders(auth));
        assertEquals(400, ex.statusCode());
        assertTrue(ex.getMessage().contains("token endpoint"));
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

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
}
