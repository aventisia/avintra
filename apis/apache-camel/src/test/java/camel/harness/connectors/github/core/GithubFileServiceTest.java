package camel.harness.connectors.github.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.client.GithubClient;
import camel.harness.connectors.github.dto.GithubRequest;
import camel.harness.connectors.github.dto.GithubResponse;
import camel.harness.connectors.github.error.GithubException;
import camel.harness.connectors.github.service.GithubFileService;
import camel.harness.connectors.github.GithubConfigurer;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the {@code file.delete} delegate service, which resolves the
 * file's current SHA from the contents API before sending the DELETE.
 */
class GithubFileServiceTest {

    private final GithubClient client = mock(GithubClient.class);
    private final GithubFileService service = new GithubFileService(client);

    private Exchange exchange(Map<String, Object> config, Map<String, Object> payload) {
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "github", "file.delete",
            config, null, null, payload, null, null);
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        exchange.setProperty(GithubConfigurer.PROP_REQUEST, request);
        exchange.setProperty(GithubConfigurer.PROP_BASE_URL, "http://stub.example");
        return exchange;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> requestBody(GithubRequest request) {
        return (Map<String, Object>) request.body();
    }

    @Test
    void deleteResolvesCurrentShaWhenNotSupplied() {
        Map<String, Object> config = Map.of("owner", "acme", "repo", "demo", "path", "hello.txt");
        Exchange exchange = exchange(config, Map.of("message", "Delete hello.txt", "branch", "main"));

        when(client.execute(eq("http://stub.example"), any(GithubRequest.class))).thenAnswer(invocation -> {
            GithubRequest request = invocation.getArgument(1);
            if ("GET".equals(request.httpMethod())) {
                return new GithubResponse(200, Map.of("sha", "abc123", "name", "hello.txt"), Map.of(), null);
            }
            return new GithubResponse(200, Map.of("commit", Map.of("sha", "commit1")), Map.of(), null);
        });

        Object result = service.delete(exchange);

        // The service issues GET (resolve sha) then DELETE against the client.
        assertEquals(Map.of("commit", Map.of("sha", "commit1")), result);
    }

    @Test
    void deleteUsesResolvedShaInRequestBody() {
        Map<String, Object> config = Map.of("owner", "acme", "repo", "demo", "path", "hello.txt");
        Exchange exchange = exchange(config, Map.of("message", "Delete hello.txt", "branch", "main"));

        // Capture the DELETE request: return current sha for the GET, then a 200 for the DELETE.
        GithubRequest[] deleteRequest = new GithubRequest[1];
        when(client.execute(eq("http://stub.example"), any(GithubRequest.class))).thenAnswer(invocation -> {
            GithubRequest request = invocation.getArgument(1);
            if ("GET".equals(request.httpMethod())) {
                return new GithubResponse(200, Map.of("sha", "current-sha-123"), Map.of(), null);
            }
            deleteRequest[0] = request;
            return new GithubResponse(200, Map.of("commit", Map.of("sha", "commit1")), Map.of(), null);
        });

        service.delete(exchange);

        GithubRequest delete = deleteRequest[0];
        assertEquals("DELETE", delete.httpMethod());
        assertEquals("/repos/acme/demo/contents/hello.txt", delete.path());
        Map<String, Object> body = requestBody(delete);
        assertEquals("current-sha-123", body.get("sha"));
        assertEquals("Delete hello.txt", body.get("message"));
        assertEquals("main", body.get("branch"));
    }

    @Test
    void deleteKeepsExplicitShaFromPayload() {
        Map<String, Object> config = Map.of("owner", "acme", "repo", "demo", "path", "hello.txt");
        Exchange exchange = exchange(config,
            Map.of("message", "Delete hello.txt", "sha", "user-supplied-sha", "branch", "main"));

        GithubRequest[] deleteRequest = new GithubRequest[1];
        when(client.execute(any(String.class), any(GithubRequest.class))).thenAnswer(invocation -> {
            GithubRequest request = invocation.getArgument(1);
            if ("GET".equals(request.httpMethod())) {
                return new GithubResponse(200, Map.of("sha", "should-not-be-used"), Map.of(), null);
            }
            deleteRequest[0] = request;
            return new GithubResponse(200, Map.of("commit", Map.of("sha", "commit1")), Map.of(), null);
        });

        service.delete(exchange);

        assertEquals("DELETE", deleteRequest[0].httpMethod());
        assertEquals("user-supplied-sha", requestBody(deleteRequest[0]).get("sha"));
    }

    @Test
    void deleteFailsWhenShaCannotBeResolved() {
        Map<String, Object> config = Map.of("owner", "acme", "repo", "demo", "path", "hello.txt");
        Exchange exchange = exchange(config, Map.of("message", "Delete hello.txt"));

        when(client.execute(any(String.class), any(GithubRequest.class)))
            .thenReturn(new GithubResponse(404, Map.of("message", "Not Found"), Map.of(), null));

        GithubException ex = assertThrows(GithubException.class, () -> service.delete(exchange));
        assertEquals(404, ex.statusCode());
        assertTrue(ex.getMessage().contains("sha"));
    }

    @Test
    void deleteRequiresOwnerRepoAndPath() {
        Exchange exchange = exchange(Map.of("owner", "acme", "repo", "demo"), Map.of("message", "x"));
        GithubException ex = assertThrows(GithubException.class, () -> service.delete(exchange));
        assertTrue(ex.getMessage().contains("path"));
    }

    @Test
    void deleteRequiresPayloadMap() {
        Exchange exchange = exchange(Map.of("owner", "acme", "repo", "demo", "path", "hello.txt"), null);
        GithubException ex = assertThrows(GithubException.class, () -> service.delete(exchange));
        assertTrue(ex.getMessage().contains("payload"));
    }
}
