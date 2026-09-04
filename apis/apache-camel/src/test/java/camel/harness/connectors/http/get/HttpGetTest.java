package camel.harness.connectors.http.get;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.http.HttpConfigurer;
import camel.harness.core.ConnectorMetadata;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the HTTP {@code get} service (the {@code GET} operation).
 * The configurer builds a {@code http(s)://host/path} producer URI.
 */
class HttpGetTest {

    private final HttpConfigurer configurer = new HttpConfigurer();

    private Exchange exchange() {
        return new DefaultExchange(new DefaultCamelContext());
    }

    private String resolve(Map<String, Object> config) {
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "http", "GET", config,
            null, null, null, null, null);
        return configurer.resolveEndpoint(exchange(), request, metadata());
    }

    private static ConnectorMetadata metadata() {
        return new ConnectorMetadata("http", "HTTP", java.util.List.of("http", "https"),
            java.util.List.of("GET", "POST"), java.util.List.of("host"),
            java.util.List.of("path", "queryParameters", "httpMethod"),
            java.util.List.of(), java.util.List.of(), java.util.List.of());
    }

    @Test
    void buildsUriFromHost() {
        assertEquals("http://localhost:8081", resolve(Map.of("host", "localhost:8081")));
    }

    @Test
    void preservesHttpsScheme() {
        assertEquals("https://api.example.com", resolve(Map.of("host", "https://api.example.com")));
    }

    @Test
    void appendsPath() {
        assertEquals("http://localhost:8081/echo", resolve(Map.of("host", "localhost:8081", "path", "echo")));
    }

    @Test
    void stripsLeadingSlashFromPath() {
        assertEquals("http://localhost:8081/items/1",
            resolve(Map.of("host", "localhost:8081", "path", "/items/1")));
    }

    @Test
    void missingHostThrows() {
        assertThrows(IllegalArgumentException.class, () -> resolve(Map.of()));
    }
}
