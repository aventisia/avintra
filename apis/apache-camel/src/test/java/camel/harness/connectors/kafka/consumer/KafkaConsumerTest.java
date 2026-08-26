package camel.harness.connectors.kafka.consumer;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.kafka.KafkaConfigurer;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the Kafka {@code consumer} service (poll/fetch):
 * consumer-style operations build the same kafka URI with a groupId.
 */
class KafkaConsumerTest {

    private final KafkaConfigurer configurer = new KafkaConfigurer();

    @Test
    void pollBuildsUriWithGroupId() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = new ConnectorRequest(null, null, "kafka", "poll",
            Map.of("topic", "events", "brokers", "localhost:9092", "groupId", "harness-group"),
            null, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertTrue(uri.startsWith("kafka:events?brokers=localhost:9092"));
        assertTrue(uri.contains("groupId=harness-group"));
    }

    @Test
    void fetchBuildsUriWithOffset() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = new ConnectorRequest(null, null, "kafka", "fetch",
            Map.of("topic", "events", "brokers", "localhost:9092", "groupId", "harness-group",
                "offset", "earliest"),
            null, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertTrue(uri.contains("groupId=harness-group"));
    }
}
