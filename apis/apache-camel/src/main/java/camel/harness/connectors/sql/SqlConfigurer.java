package camel.harness.connectors.sql;

import camel.harness.core.*;
import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

@Component
public class SqlConfigurer extends AbstractSqlConfigurer {

    public SqlConfigurer(DynamicDatabaseRegistry databaseRegistry) {
        super(databaseRegistry);
    }

    @Override
    public String connectorName() {
        return "sql";
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        return super.resolveEndpoint(exchange, request, metadata);
    }
}
