package camel.harness.connectors.github.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.client.GithubClient;
import camel.harness.connectors.github.dto.GithubRequest;
import camel.harness.connectors.github.dto.GithubResponse;
import camel.harness.connectors.github.error.GithubException;
import camel.harness.connectors.github.service.GithubCommitService;
import camel.harness.connectors.github.GithubConfigurer;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the {@code commit.list-files} delegate service, which
 * fetches a commit and extracts its {@code files} array.
 */
class GithubCommitServiceTest {

    private final GithubClient client = mock(GithubClient.class);
    private final GithubCommitService service = new GithubCommitService(client);

    private Exchange exchange(Map<String, Object> config, Map<String, Object> payload) {
        ConnectorRequest request = new ConnectorRequest(null, null, "github", "commit.list-files",
            config, null, null, payload, null, null);
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        exchange.setProperty(GithubConfigurer.PROP_REQUEST, request);
        exchange.setProperty(GithubConfigurer.PROP_BASE_URL, "http://stub.example");
        return exchange;
    }

    @Test
    void listFilesFetchesCommitAndReturnsFiles() {
        Exchange exchange = exchange(
            Map.of("owner", "acme", "repo", "demo", "ref", "main"), null);

        GithubRequest[] captured = new GithubRequest[1];
        when(client.execute(eq("http://stub.example"), any(GithubRequest.class))).thenAnswer(invocation -> {
            captured[0] = invocation.getArgument(1);
            return new GithubResponse(200,
                Map.of("sha", "abc123",
                    "files", List.of(
                        Map.of("filename", "README.md", "status", "modified"),
                        Map.of("filename", "src/Main.java", "status", "added"))),
                Map.of(), null);
        });

        Object result = service.listFiles(exchange);

        assertEquals("GET", captured[0].httpMethod());
        assertEquals("/repos/acme/demo/commits/main", captured[0].path());
        assertTrue(result instanceof List);
        assertEquals(2, ((List<?>) result).size());
    }

    @Test
    void listFilesReturnsEmptyListWhenCommitHasNoFiles() {
        Exchange exchange = exchange(
            Map.of("owner", "acme", "repo", "demo", "ref", "main"), null);

        when(client.execute(any(String.class), any(GithubRequest.class)))
            .thenReturn(new GithubResponse(200, Map.of("sha", "abc123"), Map.of(), null));

        Object result = service.listFiles(exchange);
        assertTrue(result instanceof List);
        assertEquals(0, ((List<?>) result).size());
    }

    @Test
    void listFilesRequiresRef() {
        Exchange exchange = exchange(
            Map.of("owner", "acme", "repo", "demo"), null);
        GithubException ex = assertThrows(GithubException.class, () -> service.listFiles(exchange));
        assertEquals(400, ex.statusCode());
        assertTrue(ex.getMessage().contains("ref"));
    }
}
