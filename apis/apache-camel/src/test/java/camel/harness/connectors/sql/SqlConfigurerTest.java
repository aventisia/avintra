package camel.harness.connectors.sql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

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

    @Test
    void urlStyleConnectionStringBindsDatasource() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        // URL-style connection string with credentials embedded in the userinfo.
        Map<String, String> props = Map.of(
            "url", "postgresql://postgres:Post@123@localhost:5432/WorkspaceDb");
        ConnectorRequest request = new ConnectorRequest(null, null, "sql", "query",
            Map.of("query", "SELECT 1"),
            new AuthConfiguration("database", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, props),
            null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertEquals(true, uri.startsWith("sql:SELECT%201?dataSource=#requestDataSource_"));
    }

    @Test
    void urlStyleConnectionStringWithoutUserInfoRequiresUsername() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        Map<String, String> props = Map.of(
            "url", "postgresql://localhost:5432/WorkspaceDb");
        ConnectorRequest request = new ConnectorRequest(null, null, "sql", "query",
            Map.of("query", "SELECT 1"),
            new AuthConfiguration("database", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, props),
            null, null, null, null);
        IllegalArgumentException ex = org.junit.jupiter.api.Assertions.assertThrows(
            IllegalArgumentException.class,
            () -> configurer.resolveEndpoint(exchange, request, null));
        org.junit.jupiter.api.Assertions.assertTrue(ex.getMessage().contains("username"));
    }

    @Test
    void percentEncodedUserInfoIsDecoded() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        // %40 decodes to '@', %25 decodes to '%' in the URL userinfo.
        Map<String, String> props = Map.of(
            "url", "postgresql://user%40domain:p%40ss%25word@localhost:5432/WorkspaceDb");
        ConnectorRequest request = new ConnectorRequest(null, null, "sql", "query",
            Map.of("query", "SELECT 1"),
            new AuthConfiguration("database", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, props),
            null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertTrue(uri.startsWith("sql:SELECT%201?dataSource=#requestDataSource_"));

        String beanName = uri.substring(uri.indexOf('#') + 1);
        Object bound = exchange.getContext().getRegistry().lookupByName(beanName);
        org.junit.jupiter.api.Assertions.assertNotNull(bound);
        org.junit.jupiter.api.Assertions.assertTrue(bound instanceof com.zaxxer.hikari.HikariDataSource);
        com.zaxxer.hikari.HikariDataSource ds = (com.zaxxer.hikari.HikariDataSource) bound;
        try {
            assertEquals("user@domain", ds.getUsername());
            assertEquals("p@ss%word", ds.getPassword());
        } finally {
            ds.close();
        }
    }

    @Test
    void separateCredentialsTakePrecedenceOverUrlUserInfo() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        // URL embeds credentials, but separate username/password win.
        Map<String, String> props = Map.of(
            "url", "postgresql://urluser:urlpass@localhost:5432/WorkspaceDb",
            "username", "explicit",
            "password", "explicit-pass");
        ConnectorRequest request = new ConnectorRequest(null, null, "sql", "query",
            Map.of("query", "SELECT 1"),
            new AuthConfiguration("database", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, props),
            null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        String beanName = uri.substring(uri.indexOf('#') + 1);
        Object bound = exchange.getContext().getRegistry().lookupByName(beanName);
        org.junit.jupiter.api.Assertions.assertNotNull(bound);
        com.zaxxer.hikari.HikariDataSource ds = (com.zaxxer.hikari.HikariDataSource) bound;
        try {
            assertEquals("explicit", ds.getUsername());
            assertEquals("explicit-pass", ds.getPassword());
        } finally {
            ds.close();
        }
    }

    @Test
    void missingPasswordIsFilledFromUrlUserInfo() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        // Username supplied separately; password decoded from the URL userinfo.
        Map<String, String> props = Map.of(
            "url", "postgresql://urluser:p%40ss@localhost:5432/WorkspaceDb",
            "username", "explicit");
        ConnectorRequest request = new ConnectorRequest(null, null, "sql", "query",
            Map.of("query", "SELECT 1"),
            new AuthConfiguration("database", null, null, null, null, null,
                null, null, null, null, null, null, null, null, null, null, null, null, props),
            null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        String beanName = uri.substring(uri.indexOf('#') + 1);
        Object bound = exchange.getContext().getRegistry().lookupByName(beanName);
        org.junit.jupiter.api.Assertions.assertNotNull(bound);
        com.zaxxer.hikari.HikariDataSource ds = (com.zaxxer.hikari.HikariDataSource) bound;
        try {
            assertEquals("explicit", ds.getUsername());
            assertEquals("p@ss", ds.getPassword());
        } finally {
            ds.close();
        }
    }
}
