package camel.harness.connectors.jms.consume;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.jms.JmsConfigurer;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the JMS {@code consume} service: reading a message from a
 * destination reuses the same connection-factory wiring as send.
 */
class JmsConsumeTest {

    private final JmsConfigurer configurer = new JmsConfigurer();

    @Test
    void buildsJmsUriWithDestination() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = new ConnectorRequest(null, null, "jms", "read",
            Map.of("destinationName", "orders"), null, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertTrue(uri.startsWith("jms:orders?connectionFactory=#jmsConnectionFactory_"));
    }
}
