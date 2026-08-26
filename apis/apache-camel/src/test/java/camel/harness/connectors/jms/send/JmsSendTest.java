package camel.harness.connectors.jms.send;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.jms.JmsConfigurer;
import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the JMS {@code send} service: destination resolution,
 * per-request connection factory binding, and required destination validation.
 */
class JmsSendTest {

    private final JmsConfigurer configurer = new JmsConfigurer();

    @Test
    void buildsJmsUriWithDestination() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = new ConnectorRequest(null, null, "jms", "send",
            Map.of("destinationName", "orders"), null, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertTrue(uri.startsWith("jms:orders?connectionFactory=#jmsConnectionFactory_"));
    }

    @Test
    void basicAuthBindsFactoryWithCredentials() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        AuthConfiguration auth = new AuthConfiguration("basic", "camel", "camel", null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        ConnectorRequest request = new ConnectorRequest(null, null, "jms", "send",
            Map.of("destinationName", "orders"), auth, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertTrue(uri.startsWith("jms:orders?connectionFactory=#jmsConnectionFactory_"));
        assertTrue(exchange.getContext().getRegistry().lookupByName(uri.substring(uri.indexOf('#') + 1)) != null);
    }

    @Test
    void missingDestinationThrows() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = new ConnectorRequest(null, null, "jms", "send",
            Map.of(), null, null, null, null, null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> configurer.resolveEndpoint(exchange, request, null));
        assertTrue(ex.getMessage().contains("destinationName"));
    }
}
