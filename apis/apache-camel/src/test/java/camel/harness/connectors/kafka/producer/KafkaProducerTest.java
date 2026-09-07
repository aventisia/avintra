package camel.harness.connectors.kafka.producer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.kafka.KafkaConfigurer;
import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the Kafka {@code producer} service (the {@code send}
 * operation): topic/broker URI building, SASL options, and key headers.
 */
class KafkaProducerTest {

    private final KafkaConfigurer configurer = new KafkaConfigurer();

    private String resolve(String operation, Map<String, Object> config, AuthConfiguration auth) {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "kafka", operation, config,
            auth, null, null, null, null);
        return configurer.resolveEndpoint(exchange, request, null);
    }

    @Test
    void buildsKafkaUriFromTopicAndBrokers() {
        String uri = resolve("send", Map.of("topic", "events", "brokers", "localhost:9092"), null);
        assertEquals("kafka:events?brokers=localhost:9092", uri);
    }

    @Test
    void includesOptionalKeyAndGroupId() {
        String uri = resolve("send", Map.of("topic", "events", "brokers", "localhost:9092",
            "key", "order-123", "groupId", "harness-group"), null);
        assertTrue(uri.contains("key=order-123"));
        assertTrue(uri.contains("groupId=harness-group"));
    }

    @Test
    void basicAuthAddsSaslOptions() {
        AuthConfiguration auth = new AuthConfiguration("basic", "kafka", "kafka", null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        String uri = resolve("send", Map.of("topic", "events", "brokers", "localhost:9092"), auth);
        assertTrue(uri.contains("saslMechanism=PLAIN"));
        assertTrue(uri.contains("securityProtocol=SASL_SSL"));
    }

    @Test
    void missingTopicThrows() {
        assertThrows(IllegalArgumentException.class,
            () -> resolve("send", Map.of("brokers", "localhost:9092"), null));
    }

    @Test
    void missingBrokersThrows() {
        assertThrows(IllegalArgumentException.class,
            () -> resolve("send", Map.of("topic", "events"), null));
    }
}
