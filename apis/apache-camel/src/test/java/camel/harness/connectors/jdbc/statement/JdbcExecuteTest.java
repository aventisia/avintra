package camel.harness.connectors.jdbc.statement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.jdbc.JdbcConfigurer;
import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;
import camel.harness.core.DynamicDatabaseRegistry;

/**
 * Focused tests for the JDBC {@code statement} service: the {@code execute}
 * action, data source naming, and database auth wiring.
 */
class JdbcExecuteTest {

    private final JdbcConfigurer configurer = new JdbcConfigurer(new DynamicDatabaseRegistry());

    @Test
    void buildsSqlUriWithQuery() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "jdbc", "execute",
            Map.of("query", "SELECT * FROM users"), null, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertEquals("sql:SELECT%20*%20FROM%20users", uri);
    }

    @Test
    void databaseAuthBindsDatasource() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        Map<String, String> props = Map.of(
            "url", "jdbc:postgresql://localhost/testdb",
            "username", "test",
            "password", "test");
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "jdbc", "execute",
            Map.of("query", "SELECT 1"),
            new AuthConfiguration("database", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, props),
            null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertTrue(uri.startsWith("sql:SELECT%201?dataSource=#requestDataSource_"));
    }

    @Test
    void urlStyleConnectionStringBindsDatasource() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        // URL-style connection string with credentials embedded in the userinfo.
        Map<String, String> props = Map.of(
            "url", "postgresql://postgres:Post@123@localhost:5432/WorkspaceDb");
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "jdbc", "execute",
            Map.of("query", "SELECT 1"),
            new AuthConfiguration("database", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, props),
            null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertTrue(uri.startsWith("sql:SELECT%201?dataSource=#requestDataSource_"));
    }
}
