package camel.harness.connectors.kafka;

import camel.harness.core.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

@Component
public class KafkaConfigurer implements ConnectorConfigurer {

    @Override
    public String connectorName() {
        return "kafka";
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        Map<String, Object> config = request.configurationOrEmpty();
        String topic = (String) config.get("topic");
        String brokers = (String) config.get("brokers");
        if (topic == null || topic.isBlank()) {
            throw new IllegalArgumentException("Kafka topic is required in configuration.topic");
        }
        if (brokers == null || brokers.isBlank()) {
            throw new IllegalArgumentException("Kafka brokers is required in configuration.brokers");
        }

        StringBuilder uri = new StringBuilder("kafka:").append(topic).append("?brokers=").append(brokers);

        Object key = config.get("key");
        if (key != null) {
            uri.append("&key=").append(key);
        }
        Object partitionKey = config.get("partitionKey");
        if (partitionKey != null) {
            uri.append("&partitionKey=").append(partitionKey);
        }
        Object groupId = config.get("groupId");
        if (groupId != null) {
            uri.append("&groupId=").append(groupId);
        }

        AuthConfiguration auth = request.auth();
        if (auth != null) {
            switch (auth.authType()) {
                case BASIC -> {
                    if (auth.username() != null && auth.password() != null) {
                        uri.append("&saslMechanism=PLAIN")
                           .append("&securityProtocol=SASL_SSL")
                           .append("&saslJaasConfig=")
                           .append(escape(
                               "org.apache.kafka.common.security.plain.PlainLoginModule required username=\"" + auth.username() + "\" password=\"" + auth.password() + "\";"));
                    }
                }
                case BEARER -> {
                    if (auth.token() != null) {
                        uri.append("&saslMechanism=OAUTHBEARER")
                           .append("&securityProtocol=SASL_SSL");
                    }
                }
                default -> {
                    // no-op
                }
            }
            if (auth.properties() != null) {
                auth.properties().forEach((k, v) -> uri.append("&").append(k).append("=").append(escape(v)));
            }
        }

        Object body = request.payload();
        if (body instanceof Map<?, ?> map && map.containsKey("key")) {
            exchange.getMessage().setHeader("kafka.KEY", map.get("key"));
        }
        return uri.toString();
    }

    private static String escape(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
