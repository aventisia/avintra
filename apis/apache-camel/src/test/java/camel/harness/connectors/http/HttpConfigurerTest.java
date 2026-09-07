package camel.harness.connectors.http;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;

/**
 * Connector-level unit tests for {@link HttpConfigurer}: connector name and
 * BASIC/BEARER/API_KEY header injection.
 */
class HttpConfigurerTest {

    private final HttpConfigurer configurer = new HttpConfigurer();

    @Test
    void connectorNameIsHttp() {
        assertEquals("http", configurer.connectorName());
    }

    @Test
    void basicAuthSetsAuthorizationHeader() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "http", "GET",
            Map.of("host", "example.com"),
            new AuthConfiguration("basic", "user", "pass", null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, null),
            null, null, null, null);
        configurer.resolveEndpoint(exchange, request, null);
        String expected = "Basic " + Base64.getEncoder().encodeToString("user:pass".getBytes(StandardCharsets.UTF_8));
        assertEquals(expected, exchange.getMessage().getHeader("Authorization", String.class));
    }

    @Test
    void bearerAuthSetsAuthorizationHeader() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "http", "GET",
            Map.of("host", "example.com"),
            new AuthConfiguration("bearer", null, null, "tok", null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, null),
            null, null, null, null);
        configurer.resolveEndpoint(exchange, request, null);
        assertEquals("Bearer tok", exchange.getMessage().getHeader("Authorization", String.class));
    }

    @Test
    void apiKeySetsConfiguredHeader() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "http", "GET",
            Map.of("host", "example.com"),
            new AuthConfiguration("apiKey", null, null, null, null, null,
                null, null, "key123", "X-Custom-Key", null, null, null, null, null, null, null, null, null),
            null, null, null, null);
        configurer.resolveEndpoint(exchange, request, null);
        assertEquals("key123", exchange.getMessage().getHeader("X-Custom-Key", String.class));
    }
}
