package camel.harness.connectors.jdbc;

import camel.harness.core.*;
import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

@Component
public class JdbcConfigurer extends AbstractSqlConfigurer {

    public JdbcConfigurer(DynamicDatabaseRegistry databaseRegistry) {
        super(databaseRegistry);
    }

    @Override
    public String connectorName() {
        return "jdbc";
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        return super.resolveEndpoint(exchange, request, metadata);
    }
}
