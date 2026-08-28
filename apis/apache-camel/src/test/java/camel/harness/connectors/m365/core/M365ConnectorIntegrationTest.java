package camel.harness.connectors.m365.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import camel.harness.connectors.m365.M365ServiceTestSupport;
import camel.harness.core.AuthConfiguration;

/**
 * End-to-end integration test for the M365 / Microsoft Graph connector. A
 * lightweight embedded HTTP server stands in for {@code graph.microsoft.com}, and
 * the connector's base URL is pointed at it via the {@code m365.base-url}
 * property. Tests drive the real REST endpoint ({@code POST /connectors/m365})
 * through the harness's dispatch pipeline and the registered {@code direct:m365.*}
 * routes.
 */
@SpringBootTest(classes = camel.harness.core.CamelConnectorHarnessApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class M365ConnectorIntegrationTest {

    private static HttpServer server;
    private static String baseUrl;

    @DynamicPropertySource
    static void m365BaseUrl(DynamicPropertyRegistry registry) {
        registry.add("m365.base-url", () -> baseUrl);
        registry.add("m365.token-url", () -> baseUrl + "/oauth2/v2.0/token");
    }

    @Autowired
    private TestRestTemplate rest;
    @Autowired
    private ObjectMapper objectMapper;

    @BeforeAll
    static void startStub() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/", exchange -> {
            String path = exchange.getRequestURI().getPath();
            String method = exchange.getRequestMethod();
            String query = exchange.getRequestURI().getQuery();
            if (path.equals("/oauth2/v2.0/token") && method.equals("POST")) {
                respond(exchange, 200, "{\"token_type\":\"Bearer\",\"expires_in\":3600,\"access_token\":\"integration_token\"}");
            } else if (path.equals("/oauth2/v2.0/devicecode") && method.equals("POST")) {
                respond(exchange, 200, "{\"device_code\":\"dev-1\",\"user_code\":\"ABCD-EFGH\","
                    + "\"verification_uri\":\"https://microsoft.com/devicelogin\",\"interval\":5}");
            } else if (path.equals("/users/alex@contoso.com") && method.equals("GET")) {
                // Echo the query string so tests can assert OData params are passed
                // cleanly (not corrupted by camel-http component options).
                respond(exchange, 200, "{\"id\":\"u1\",\"displayName\":\"Alex\",\"userPrincipalName\":\"alex@contoso.com\",\"query\":\""
                    + (query == null ? "" : query) + "\"}");
            } else if (path.equals("/users/alex@contoso.com/profile") && method.equals("GET")) {
                respond(exchange, 200, "{\"id\":\"u1\",\"displayName\":\"Alex\",\"emails\":[{\"address\":\"alex@contoso.com\"}]}");
            } else if (path.equals("/users/alex@contoso.com/mailboxSettings") && method.equals("GET")) {
                respond(exchange, 200, "{\"timeZone\":\"UTC\",\"language\":{\"locale\":\"en-US\"}}");
            } else if (path.equals("/users/alex@contoso.com/licenseDetails") && method.equals("GET")) {
                respond(exchange, 200, "{\"value\":[{\"skuId\":\"sku-1\",\"skuPartNumber\":\"ENTERPRISEPREMIUM\"}]}");
            } else if (path.equals("/users") && method.equals("GET")) {
                respond(exchange, 200, "{\"value\":[{\"id\":\"u1\",\"displayName\":\"Alex\"},{\"id\":\"u2\",\"displayName\":\"Sam\"}]}");
            } else if (path.equals("/users") && method.equals("POST")) {
                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                @SuppressWarnings("unchecked")
                Map<String, Object> payload = new ObjectMapper().readValue(body, Map.class);
                respond(exchange, 201, "{\"id\":\"u3\",\"displayName\":\"" + payload.get("displayName") + "\"}");
            } else if (path.equals("/users/alex@contoso.com/sendMail") && method.equals("POST")) {
                // Real Graph rejects a POST with a body but no Content-Type with
                // RequestBodyRead. Echo the received content-type when present so
                // tests can assert the client always sends one.
                String contentType = exchange.getRequestHeaders().getFirst("Content-Type");
                if (contentType == null) {
                    respond(exchange, 400, "{\"error\":{\"code\":\"RequestBodyRead\","
                        + "\"message\":\"A missing or empty content type header was found when trying to read a message.\"}}");
                } else {
                    respond(exchange, 202, "{\"contentType\":\"" + contentType + "\"}");
                }
            } else if (path.equals("/groups/g1/members/$ref") && method.equals("POST")) {
                respond(exchange, 204, "");
            } else if (path.equals("/me/drive/items/i1/content") && method.equals("GET")) {
                String b64 = Base64.getEncoder().encodeToString("hello file".getBytes(StandardCharsets.UTF_8));
                respond(exchange, 200, "{\"contentBytes\":\"" + b64 + "\"}");
            } else if (path.equals("/users/missing") && method.equals("GET")) {
                respond(exchange, 404, "{\"error\":{\"code\":\"Request_ResourceNotFound\",\"message\":\"User not found\"}}");
            } else if (path.equals("/users/denied") && method.equals("GET")) {
                respond(exchange, 403, "{\"error\":{\"code\":\"Authorization_RequestDenied\",\"message\":\"Insufficient privileges to complete the operation\"}}");
            } else if (path.equals("/users/ratelimited") && method.equals("GET")) {
                respondWithRetryAfter(exchange, 429, "{\"error\":{\"code\":\"TooManyRequests\",\"message\":\"throttled\"}}");
            } else if (path.equals("/me/messages") && method.equals("GET")) {
                respond(exchange, 200, "{\"value\":[{\"id\":\"m1\",\"subject\":\"Me mail\"}]}");
            } else if (path.equals("/users/alex@contoso.com/messages") && method.equals("GET")) {
                // Echo the query string so tests can assert OData params are passed
                // cleanly (not corrupted by camel-http component options).
                respond(exchange, 200, "{\"value\":[{\"id\":\"m2\",\"subject\":\"User mail\"}],\"query\":\""
                    + (query == null ? "" : query) + "\"}");
            } else if (path.equals("/users/paged@contoso.com/messages") && method.equals("GET")) {
                // First page of a paginated response. Graph's @odata.nextLink is a
                // full canonical URL that includes the "/v1.0" version segment.
                respond(exchange, 200, "{\"value\":[{\"id\":\"p1\",\"subject\":\"Page one\"}],"
                    + "\"@odata.nextLink\":\"" + baseUrl + "/v1.0/users/paged@contoso.com/messages?$skiptoken=abc\"}");
            } else if (path.equals("/v1.0/users/paged@contoso.com/messages") && method.equals("GET")) {
                respond(exchange, 200, "{\"value\":[{\"id\":\"p2\",\"subject\":\"Page two\"}]}");
            } else if (path.equals("/search/query") && method.equals("POST")) {
                respond(exchange, 200, "{\"value\":[{\"hitsContainers\":[{\"hits\":[{\"resource\":{\"displayName\":\"Doc\"}}]}]}]}");
            } else {
                respond(exchange, 404, "{\"error\":{\"code\":\"unexpected_stub_path\",\"message\":\"unexpected stub path " + path + "\"}}");
            }
        });
        server.start();
        baseUrl = "http://localhost:" + server.getAddress().getPort();
    }

    @AfterAll
    static void stopStub() {
        if (server != null) {
            server.stop(0);
        }
    }

    private static void respond(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(bytes);
        }
        exchange.close();
    }

    private static void respondWithRetryAfter(HttpExchange exchange, int status, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().add("Content-Type", "application/json");
        exchange.getResponseHeaders().add("Retry-After", "1");
        exchange.sendResponseHeaders(status, bytes.length);
        try (OutputStream out = exchange.getResponseBody()) {
            out.write(bytes);
        }
        exchange.close();
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private ResponseEntity<Map> post(String operation, Map<String, Object> config,
            AuthConfiguration auth, Object payload) {
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("connector", "m365");
        request.put("operation", operation);
        request.put("configuration", config);
        if (auth != null) {
            request.put("auth", auth);
        }
        if (payload != null) {
            request.put("payload", payload);
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return rest.postForEntity("/connectors/m365", new HttpEntity<>(request, headers), Map.class);
    }

    // ------------------------------------------------------------------
    // Tests
    // ------------------------------------------------------------------

    @Test
    void userGetResolvesPathParam() {
        ResponseEntity<Map> response = post("user.get",
            M365ServiceTestSupport.configMap("userId", "alex@contoso.com"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertEquals("user.get", response.getBody().get("operation"));
        assertTrue(response.getBody().get("data").toString().contains("alex@contoso.com"));
    }

    @Test
    void userListReturnsBody() {
        ResponseEntity<Map> response = post("user.list", Map.of(),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertTrue(response.getBody().get("data").toString().contains("Alex"));
        assertTrue(response.getBody().get("data").toString().contains("Sam"));
    }

    @Test
    void userCreateSendsPayload() {
        ResponseEntity<Map> response = post("user.create", Map.of(),
            M365ServiceTestSupport.accessToken("graph_test"),
            Map.of("displayName", "New Hire", "userPrincipalName", "new@contoso.com"));
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertTrue(response.getBody().get("data").toString().contains("New Hire"));
    }

    @Test
    void mailSendDelegatesToService() {
        ResponseEntity<Map> response = post("mail.send",
            M365ServiceTestSupport.configMap("userId", "alex@contoso.com"),
            M365ServiceTestSupport.accessToken("graph_test"),
            Map.of("message", Map.of("subject", "Hello", "toRecipients", java.util.List.of())));
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertEquals("mail.send", response.getBody().get("operation"));
        // The client must have sent Content-Type: application/json, otherwise the
        // stub (mirroring real Graph's RequestBodyRead rejection) would have
        // returned 400.
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertEquals("application/json", body.get("contentType"));
    }

    @Test
    void groupAddMemberUsesRefPath() {
        ResponseEntity<Map> response = post("group.add-member",
            M365ServiceTestSupport.configMap("groupId", "g1"),
            M365ServiceTestSupport.accessToken("graph_test"),
            Map.of("@odata.id", "https://graph.microsoft.com/v1.0/directoryObjects/u9"));
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
    }

    @Test
    void driveFileDownloadEncodesContent() {
        ResponseEntity<Map> response = post("onedrive.download",
            M365ServiceTestSupport.configMap("itemId", "i1"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertTrue(response.getBody().get("data").toString().contains("contentBytes"));
    }

    @Test
    void missingUserReturnsGraphErrorEnvelope() {
        ResponseEntity<Map> response = post("user.get",
            M365ServiceTestSupport.configMap("userId", "missing"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(404, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("success"));
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertTrue(error.get("message").toString().contains("User not found"));
    }

    @Test
    void notFoundEnvelopeCarriesCanonicalErrorType() {
        ResponseEntity<Map> response = post("user.get",
            M365ServiceTestSupport.configMap("userId", "missing"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(404, response.getStatusCode().value());
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertEquals("not_found", error.get("code"));
        assertEquals("Request_ResourceNotFound", error.get("graphCode"));
    }

    @Test
    void permissionDeniedEnvelopeCarriesCanonicalErrorType() {
        ResponseEntity<Map> response = post("user.get",
            M365ServiceTestSupport.configMap("userId", "denied"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(403, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("success"));
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertEquals("insufficient_permissions", error.get("code"));
        assertEquals("Authorization_RequestDenied", error.get("graphCode"));
    }

    @Test
    void rateLimitedEnvelopeCarriesCanonicalErrorTypeAndRetryAfter() {
        ResponseEntity<Map> response = post("user.get",
            M365ServiceTestSupport.configMap("userId", "ratelimited"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(429, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("success"));
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertEquals("rate_limited", error.get("code"));
        assertTrue(error.containsKey("retryAfterSeconds"));
    }

    @Test
    void oauth2ClientCredentialsAcquiresToken() {
        ResponseEntity<Map> response = post("user.get",
            M365ServiceTestSupport.configMap("userId", "alex@contoso.com"),
            M365ServiceTestSupport.oauth2("tenant", "cid", "secret"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
    }

    @Test
    void searchDelegatesToService() {
        ResponseEntity<Map> response = post("search.files",
            M365ServiceTestSupport.configMap("q", "quarterly"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertTrue(response.getBody().get("data").toString().contains("Doc"));
    }

    @Test
    void authGetTokenViaAuthBlock() {
        ResponseEntity<Map> response = post("auth.get-token", Map.of(),
            M365ServiceTestSupport.clientCredentials("tenant", "cid-auth", "secret"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertEquals("auth.get-token", response.getBody().get("operation"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertEquals("integration_token", body.get("access_token"));
        assertEquals("client_credentials", body.get("grant"));
        assertEquals(false, body.get("cached"));
    }

    @Test
    void authGetTokenViaConfiguration() {
        ResponseEntity<Map> response = post("auth.get-token",
            M365ServiceTestSupport.configMap("tenantId", "tenant", "clientId", "cid-config",
                "clientSecret", "secret"),
            null, null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertEquals("integration_token", body.get("access_token"));
        assertEquals(false, body.get("cached"));
    }

    @Test
    void authGetTokenMissingCredentialsFails() {
        ResponseEntity<Map> response = post("auth.get-token", Map.of(), null, null);
        assertEquals(400, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("success"));
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertTrue(error.get("message").toString().contains("client"));
    }

    @Test
    void authAuthorizationCodeExchangesCode() {
        ResponseEntity<Map> response = post("auth.authorization-code", Map.of(),
            M365ServiceTestSupport.authorizationCode("tenant", "cid-authcode", "secret",
                "code-1", "http://localhost:8080/callback"),
            null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertEquals("auth.authorization-code", response.getBody().get("operation"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertEquals("integration_token", body.get("access_token"));
        assertEquals("authorization_code", body.get("grant"));
    }

    @Test
    void authRefreshTokenExchangesRefreshToken() {
        ResponseEntity<Map> response = post("auth.refresh-token", Map.of(),
            M365ServiceTestSupport.refreshToken("tenant", "cid-refresh", "secret", "refresh-1"),
            null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertEquals("integration_token", body.get("access_token"));
        assertEquals("refresh_token", body.get("grant"));
    }

    @Test
    void authDeviceCodeStartReturnsUserCode() {
        ResponseEntity<Map> response = post("auth.device-code-start", Map.of(),
            M365ServiceTestSupport.deviceCode("tenant", "cid-device", "secret", null),
            null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertEquals("device_code", body.get("grant"));
        assertEquals("dev-1", body.get("device_code"));
        assertEquals("ABCD-EFGH", body.get("user_code"));
    }

    @Test
    void authDeviceCodePollExchangesDeviceCode() {
        ResponseEntity<Map> response = post("auth.device-code-poll", Map.of(),
            M365ServiceTestSupport.deviceCode("tenant", "cid-device-poll", "secret", "dev-1"),
            null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertEquals("integration_token", body.get("access_token"));
        assertEquals("device_code", body.get("grant"));
    }

    @Test
    void authOnBehalfOfExchangesAssertion() {
        ResponseEntity<Map> response = post("auth.on-behalf-of", Map.of(),
            M365ServiceTestSupport.onBehalfOf("tenant", "cid-obo", "secret", "caller-jwt"),
            null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertEquals("integration_token", body.get("access_token"));
        assertEquals("on_behalf_of", body.get("grant"));
    }

    @Test
    void userGetProfileResolvesPath() {
        ResponseEntity<Map> response = post("user.get-profile",
            M365ServiceTestSupport.configMap("userId", "alex@contoso.com"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertEquals("user.get-profile", response.getBody().get("operation"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertEquals("u1", body.get("id"));
        assertEquals("Alex", body.get("displayName"));
    }

    @Test
    void userGetOutlookSettingsResolvesPath() {
        ResponseEntity<Map> response = post("user.get-outlook-settings",
            M365ServiceTestSupport.configMap("userId", "alex@contoso.com"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertEquals("UTC", body.get("timeZone"));
    }

    @Test
    void userGetLicenseDetailsIsPaginated() {
        ResponseEntity<Map> response = post("user.get-license-details",
            M365ServiceTestSupport.configMap("userId", "alex@contoso.com"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        assertTrue(body.get("value").toString().contains("ENTERPRISEPREMIUM"));
    }

    // ------------------------------------------------------------------
    // userPrincipalName alias + delegated-token /me routing
    // ------------------------------------------------------------------

    @Test
    void mailListAcceptsUserPrincipalNameAlias() {
        ResponseEntity<Map> response = post("mail.list",
            M365ServiceTestSupport.configMap("userPrincipalName", "alex@contoso.com"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertTrue(response.getBody().get("data").toString().contains("User mail"));
    }

    @Test
    void mailListUsesMeForDelegatedUserToken() {
        ResponseEntity<Map> response = post("mail.list", Map.of(),
            M365ServiceTestSupport.accessToken(delegatedUserToken()), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertTrue(response.getBody().get("data").toString().contains("Me mail"));
    }

    @Test
    void mailListRequiresIdForAppToken() {
        ResponseEntity<Map> response = post("mail.list", Map.of(),
            M365ServiceTestSupport.clientCredentials("tenant", "cid", "secret"), null);
        assertEquals(400, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("success"));
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertTrue(error.get("message").toString().contains("userPrincipalName"));
        assertEquals("missing_parameter", error.get("code"));
    }

    @Test
    void mailListFollowsNextLinkAndAggregatesPages() {
        // End-to-end pagination: the first page returns an @odata.nextLink (with
        // the "/v1.0" version segment, as Graph does) and the client must follow it
        // and aggregate both pages' values without duplicating the version segment.
        ResponseEntity<Map> response = post("mail.list",
            M365ServiceTestSupport.configMap("userId", "paged@contoso.com"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        String body = response.getBody().get("data").toString();
        assertTrue(body.contains("Page one"));
        assertTrue(body.contains("Page two"));
    }

    @Test
    void userGetPassesODataQueryParamsCleanly() {
        // Regression: camel-http component options must be appended with '&' when
        // the URI already carries a query string, otherwise $select=id becomes
        // "id?httpMethod=GET" and Graph rejects it with BadRequest.
        ResponseEntity<Map> response = post("user.get",
            M365ServiceTestSupport.configMap("userId", "alex@contoso.com", "$select", "id,displayName"),
            M365ServiceTestSupport.accessToken("graph_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        Map<?, ?> body = (Map<?, ?>) response.getBody().get("data");
        String query = String.valueOf(body.get("query"));
        // The stub echoes the decoded query string; it must contain the OData
        // $select param and must NOT contain camel-http component options.
        assertTrue(query.contains("$select=id,displayName"), "expected $select in query, got: " + query);
        assertFalse(query.contains("httpMethod"), "camel-http options leaked into query: " + query);
    }

    private static String delegatedUserToken() {
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString(
            "{\"alg\":\"none\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
        String payload = Base64.getUrlEncoder().withoutPadding().encodeToString(
            "{\"idtyp\":\"user\",\"oid\":\"u1\"}".getBytes(StandardCharsets.UTF_8));
        return header + "." + payload + ".sig";
    }
}
