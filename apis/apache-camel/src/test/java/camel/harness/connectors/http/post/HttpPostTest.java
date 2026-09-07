package camel.harness.connectors.http.post;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.http.HttpConfigurer;
import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the HTTP {@code post} service (the {@code POST} operation).
 */
class HttpPostTest {

    private final HttpConfigurer configurer = new HttpConfigurer();

    @Test
    void buildsUriFromHostAndPath() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "http", "POST",
            Map.of("host", "localhost:8081", "path", "echo"), null, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertEquals("http://localhost:8081/echo", uri);
    }

    @Test
    void carriesBearerAuthHeader() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "http", "POST",
            Map.of("host", "localhost:8081", "path", "echo"),
            new AuthConfiguration("bearer", null, null, "secret-token", null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, null),
            null, null, null, null);
        configurer.resolveEndpoint(exchange, request, null);
        assertEquals("Bearer secret-token", exchange.getMessage().getHeader("Authorization", String.class));
    }

    @Test
    void targetUriCanBePassedDirectly() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy("http://localhost:8081/echo", null, "http", "POST",
            Map.of(), null, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertEquals("http://localhost:8081/echo", uri);
    }
}
