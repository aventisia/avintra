package camel.harness.connectors.sql.query;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.sql.SqlConfigurer;
import camel.harness.core.ConnectorRequest;
import camel.harness.core.DynamicDatabaseRegistry;

/**
 * Focused tests for the SQL {@code query} service: URI building, query
 * encoding, and the requirement that a query is present.
 */
class SqlSelectTest {

    private final SqlConfigurer configurer = new SqlConfigurer(new DynamicDatabaseRegistry());

    @Test
    void buildsSqlUriFromQuery() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "sql", "select",
            Map.of("query", "SELECT * FROM users"), null, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertEquals("sql:SELECT%20*%20FROM%20users", uri);
    }

    @Test
    void missingQueryThrows() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "sql", "select",
            Map.of(), null, null, null, null, null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> configurer.resolveEndpoint(exchange, request, null));
        assertTrue(ex.getMessage().contains("query"));
    }

    @Test
    void encodesReservedCharacters() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "sql", "select",
            Map.of("query", "SELECT * FROM users WHERE id = ? AND name = 'a b'"),
            null, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertEquals("sql:SELECT%20*%20FROM%20users%20WHERE%20id%20=%20%3F%20AND%20name%20=%20'a%20b'", uri);
    }
}
