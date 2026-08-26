package camel.harness.core;

import jakarta.jms.ConnectionFactory;
import org.apache.activemq.artemis.jms.client.ActiveMQConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BackendConfiguration {
    @Bean
    ConnectionFactory artemisConnectionFactory() {
        return new ActiveMQConnectionFactory("tcp://localhost:61616", "camel", "camel");
    }
}
