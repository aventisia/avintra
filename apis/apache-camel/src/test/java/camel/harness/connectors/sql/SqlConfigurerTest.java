package camel.harness.connectors.sql;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;
import camel.harness.core.DynamicDatabaseRegistry;

/**
 * Connector-level unit tests for {@link SqlConfigurer}: connector name and
 * database auth wiring that binds a pooled datasource.
 */
class SqlConfigurerTest {

    private final SqlConfigurer configurer = new SqlConfigurer(new DynamicDatabaseRegistry());

    @Test
    void connectorNameIsSql() {
        assertEquals("sql", configurer.connectorName());
    }

    @Test
    void databaseAuthBindsDatasource() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        Map<String, String> props = Map.of(
            "url", "jdbc:postgresql://localhost/testdb",
            "username", "test",
            "password", "test");
        ConnectorRequest request = new ConnectorRequest(null, null, "sql", "select",
            Map.of("query", "SELECT 1"),
            new AuthConfiguration("database", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, props),
            null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertEquals(true, uri.startsWith("sql:SELECT%201?dataSource=#requestDataSource_"));
    }
}
