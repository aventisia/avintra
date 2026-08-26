package camel.harness.connectors.jms;

import camel.harness.core.*;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import jakarta.jms.ConnectionFactory;
import org.apache.activemq.artemis.jms.client.ActiveMQConnectionFactory;
import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

@Component
public class JmsConfigurer implements ConnectorConfigurer {

    private final Map<String, ConnectionFactory> connectionFactories = new ConcurrentHashMap<>();

    @Override
    public String connectorName() {
        return "jms";
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        Map<String, Object> config = request.configurationOrEmpty();
        String destination = (String) config.get("destinationName");
        if (destination == null || destination.isBlank()) {
            throw new IllegalArgumentException("JMS destinationName is required in configuration.destinationName");
        }

        String brokerUrl = null;
        String username = null;
        String password = null;
        AuthConfiguration auth = request.auth();
        if (auth != null && auth.authType() == AuthType.BASIC) {
            brokerUrl = auth.properties() != null ? auth.properties().get("brokerUrl") : null;
            username = auth.username();
            password = auth.password();
        }
        if (brokerUrl == null || brokerUrl.isBlank()) {
            brokerUrl = "tcp://localhost:61616";
        }

        final String finalBrokerUrl = brokerUrl;
        final String finalUsername = username;
        final String finalPassword = password;
        String beanName = "jmsConnectionFactory_" + fingerprint(finalBrokerUrl, finalUsername);
        ConnectionFactory factory = connectionFactories.computeIfAbsent(beanName, ignored -> {
            ActiveMQConnectionFactory activeMq = finalUsername != null
                ? new ActiveMQConnectionFactory(finalBrokerUrl, finalUsername, finalPassword)
                : new ActiveMQConnectionFactory(finalBrokerUrl);
            return activeMq;
        });
        exchange.getContext().getRegistry().bind(beanName, factory);

        return "jms:" + destination + "?connectionFactory=#" + beanName;
    }

    private static String fingerprint(String brokerUrl, String username) {
        return Integer.toHexString((brokerUrl + "\n" + username).hashCode());
    }
}
