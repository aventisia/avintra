package camel.harness.connectors.jdbc;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import camel.harness.core.DynamicDatabaseRegistry;

/**
 * Connector-level unit tests for {@link JdbcConfigurer}.
 */
class JdbcConfigurerTest {

    @Test
    void connectorNameIsJdbc() {
        JdbcConfigurer configurer = new JdbcConfigurer(new DynamicDatabaseRegistry());
        assertEquals("jdbc", configurer.connectorName());
    }
}
