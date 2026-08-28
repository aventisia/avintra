package camel.harness.connectors.github.core;

import camel.harness.core.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
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

/**
 * End-to-end integration test for the GitHub connector. A lightweight embedded
 * HTTP server stands in for {@code api.github.com}, and the connector's base URL
 * is pointed at it via the {@code github.base-url} property. Tests drive the
 * real REST endpoint ({@code POST /connectors/github}) through the harness's
 * dispatch pipeline and the registered {@code direct:github.*} routes.
 */
@SpringBootTest(classes = camel.harness.core.CamelConnectorHarnessApplication.class,
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GithubConnectorIntegrationTest {

    private static HttpServer server;
    private static String baseUrl;

    @DynamicPropertySource
    static void githubBaseUrl(DynamicPropertyRegistry registry) {
        registry.add("github.base-url", () -> baseUrl);
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
            if (path.equals("/user/repos") && method.equals("GET")) {
                respond(exchange, 200, "[{\"id\":1,\"full_name\":\"acme/demo\",\"private\":false}]");
            } else if (path.equals("/repos/acme/demo") && method.equals("GET")) {
                respond(exchange, 200, "{\"id\":1,\"full_name\":\"acme/demo\",\"default_branch\":\"main\"}");
            } else if (path.equals("/repos/acme/demo/issues") && method.equals("POST")) {
                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                @SuppressWarnings("unchecked")
                Map<String, Object> payload = new ObjectMapper().readValue(body, Map.class);
                respond(exchange, 201, "{\"id\":10,\"number\":1,\"title\":\"" + payload.get("title") + "\"}");
            } else if (path.equals("/repos/acme/demo") && method.equals("PATCH")) {
                respond(exchange, 200, "{\"id\":1,\"full_name\":\"acme/demo\",\"archived\":true}");
            } else if (path.equals("/repos/acme/demo") && method.equals("DELETE")) {
                respond(exchange, 204, "");
            } else if (path.equals("/repos/acme/demo/contents/hello.txt") && method.equals("GET")) {
                respond(exchange, 200, "{\"name\":\"hello.txt\",\"sha\":\"abc123\",\"size\":5}");
            } else if (path.equals("/repos/acme/demo/contents/hello.txt") && method.equals("DELETE")) {
                // Behave like GitHub: the contents API requires {message, sha} in
                // the DELETE body. If the body was dropped (missing deleteWithBody),
                // reply 422 exactly as GitHub does.
                String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
                if (body == null || body.isBlank()) {
                    respond(exchange, 422, "{\"message\":\"Invalid request.\\n\\n\\\"message\\\", \\\"sha\\\" weren't supplied.\"}");
                } else {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> payload = new ObjectMapper().readValue(body, Map.class);
                    respond(exchange, 200, "{\"deleted\":true,\"sha\":\"" + payload.get("sha")
                        + "\",\"commit\":{\"sha\":\"deleted-commit\"}}");
                }
            } else if (path.equals("/repos/acme/missing-file/contents/hello.txt") && method.equals("GET")) {
                respond(exchange, 404, "{\"message\":\"Not Found\"}");
            } else if (path.equals("/search/repositories") && method.equals("GET")) {
                respond(exchange, 200,
                    "{\"total_count\":1,\"items\":[{\"id\":1,\"full_name\":\"acme/demo\"}]}");
            } else if (path.equals("/repos/acme/missing") && method.equals("GET")) {
                respond(exchange, 404, "{\"message\":\"Not Found\"}");
            } else if (path.equals("/repos/acme/rate") && method.equals("GET")) {
                respond(exchange, 429, "{\"message\":\"API rate limit exceeded\"}");
            } else if (path.equals("/oauth/token") && method.equals("POST")) {
                respond(exchange, 200, "{\"access_token\":\"oauth_integration_token\",\"token_type\":\"bearer\"}");
            } else if (path.equals("/user") && method.equals("GET")) {
                respond(exchange, 200, "{\"login\":\"octocat\",\"id\":1}");
            } else {
                respond(exchange, 404, "{\"message\":\"unexpected stub path " + path + "\"}");
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
        exchange.getResponseHeaders().add("X-RateLimit-Remaining", "50");
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
        request.put("connector", "github");
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
        return rest.postForEntity("/connectors/github", new HttpEntity<>(request, headers), Map.class);
    }

    private static AuthConfiguration accessToken(String token) {
        return new AuthConfiguration("accessToken", null, null, token, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    // ------------------------------------------------------------------
    // Tests
    // ------------------------------------------------------------------

    @Test
    void repositoryListReturnsBody() {
        ResponseEntity<Map> response = post("repository.list", Map.of(), accessToken("ghp_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertEquals("github", response.getBody().get("connector"));
        assertTrue(response.getBody().get("data").toString().contains("acme/demo"));
    }

    @Test
    void repositoryGetResolvesPathParams() {
        ResponseEntity<Map> response = post("repository.get",
            Map.of("owner", "acme", "repo", "demo"), accessToken("ghp_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertEquals("repository.get", response.getBody().get("operation"));
        assertTrue(response.getBody().get("data").toString().contains("acme/demo"));
    }

    @Test
    void issueCreateSendsPayload() {
        ResponseEntity<Map> response = post("issue.create",
            Map.of("owner", "acme", "repo", "demo"), accessToken("ghp_test"),
            Map.of("title", "Integration bug", "body", "details"));
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertTrue(response.getBody().get("data").toString().contains("Integration bug"));
    }

    @Test
    void repositoryArchivePatch() {
        ResponseEntity<Map> response = post("repository.archive",
            Map.of("owner", "acme", "repo", "demo"), accessToken("ghp_test"),
            Map.of("archived", true));
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        Map<String, Object> body = (Map<String, Object>) response.getBody().get("data");
        assertEquals(true, body.get("archived"));
    }

    @Test
    void repositoryDeleteReturnsEmptyBody() {
        ResponseEntity<Map> response = post("repository.delete",
            Map.of("owner", "acme", "repo", "demo"), accessToken("ghp_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
    }

    @Test
    void fileDeleteResolvesCurrentShaAndDeletes() {
        ResponseEntity<Map> response = post("file.delete",
            Map.of("owner", "acme", "repo", "demo", "path", "hello.txt"),
            accessToken("ghp_test"),
            Map.of("message", "Delete hello.txt", "branch", "main"));
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertEquals("file.delete", response.getBody().get("operation"));
        // The DELETE body (with the SHA resolved from the GET) must actually reach
        // GitHub; the stub echoes the sha it received.
        Map<String, Object> body = (Map<String, Object>) response.getBody().get("data");
        assertNotNull(body);
        assertEquals("abc123", body.get("sha"));
        assertEquals(true, body.get("deleted"));
    }

    @Test
    void fileDeleteMissingFileSurfacesTypedError() {
        ResponseEntity<Map> response = post("file.delete",
            Map.of("owner", "acme", "repo", "missing-file", "path", "hello.txt"),
            accessToken("ghp_test"),
            Map.of("message", "Delete hello.txt"));
        assertEquals(404, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("success"));
        // The 404 from the contents GET (file does not exist) propagates as an
        // API error carrying GitHub's real message.
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertEquals("GITHUBAPIEXCEPTION", error.get("code"));
        assertTrue(error.get("message").toString().contains("404"));
        assertTrue(error.get("message").toString().contains("Not Found"));
    }

    @Test
    void searchReturnsAggregatedResult() {
        ResponseEntity<Map> response = post("search.repositories",
            Map.of("q", "camel"), accessToken("ghp_test"), null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertTrue(response.getBody().get("data").toString().contains("total_count"));
    }

    @Test
    void missingPathParamProducesSafeError() {
        ResponseEntity<Map> response = post("repository.get",
            Map.of("owner", "acme"), accessToken("ghp_test"), null);
        assertEquals(400, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("success"));
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertTrue(error.get("message").toString().contains("repo"));
    }

    @Test
    void githubApiErrorSurfacesStatusAndMessage() {
        ResponseEntity<Map> response = post("repository.get",
            Map.of("owner", "acme", "repo", "missing"), accessToken("ghp_test"), null);
        assertEquals(404, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("success"));
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertEquals("GITHUBAPIEXCEPTION", error.get("code"));
        assertTrue(error.get("message").toString().contains("404"));
        assertTrue(error.get("message").toString().contains("Not Found"));
    }

    @Test
    void rateLimitProducesTypedError() {
        ResponseEntity<Map> response = post("repository.get",
            Map.of("owner", "acme", "repo", "rate"), accessToken("ghp_test"), null);
        assertEquals(429, response.getStatusCode().value());
        assertEquals(false, response.getBody().get("success"));
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertEquals("GITHUBRATELIMITEXCEPTION", error.get("code"));
        assertTrue(error.get("message").toString().contains("rate limit"));
    }

    @Test
    void unknownOperationFailsValidation() {
        ResponseEntity<Map> response = post("nope.nope", Map.of(), accessToken("ghp_test"), null);
        // Metadata validation runs in the harness prepareRequest phase, which
        // reports unsupported operations through the shared 502 error envelope.
        assertEquals(502, response.getStatusCode().value());
        Map<?, ?> error = (Map<?, ?>) response.getBody().get("error");
        assertTrue(error.get("message").toString().contains("Unsupported operation"));
    }

    @Test
    void oauthFlowAcquiresTokenFromTokenEndpoint() {
        AuthConfiguration oauth = new AuthConfiguration("oauth2", null, null, null, null, null,
            "client-123", "client-secret", null, null, null, null, null, null, null, null,
            baseUrl + "/oauth/token", "repo", null);
        ResponseEntity<Map> response = post("user.get-current", Map.of(), oauth, null);
        assertEquals(200, response.getStatusCode().value());
        assertEquals(true, response.getBody().get("success"));
        assertTrue(response.getBody().get("data").toString().contains("octocat"));
    }
}
