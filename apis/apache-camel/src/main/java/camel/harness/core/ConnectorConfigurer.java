package camel.harness.core;

import org.apache.camel.Exchange;

/**
 * Strategy interface for transforming a connector request into a Camel URI
 * and exchange state (headers/body) before the dynamic dispatch.
 */
public interface ConnectorConfigurer {

    /**
     * The connector family this configurer handles, e.g. "http", "sql", "kafka".
     */
    String connectorName();

    /**
     * Apply connector-specific transformation and return the final Camel endpoint URI.
     */
    String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata);
}
