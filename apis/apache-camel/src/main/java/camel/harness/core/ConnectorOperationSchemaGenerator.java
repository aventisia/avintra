package camel.harness.core;

import org.springframework.stereotype.Component;

/**
 * Generates a per-operation JSON Schema for any connector. The operation is
 * validated against the connector metadata and pinned into the returned schema.
 * Connectors without an operation enum (generic catalog components) accept any
 * operation.
 */
@Component
public class ConnectorOperationSchemaGenerator {

    private final ConnectorSchemaGenerator schemaGenerator;

    public ConnectorOperationSchemaGenerator(ConnectorSchemaGenerator schemaGenerator) {
        this.schemaGenerator = schemaGenerator;
    }

    /**
     * Generates a minimal request schema for a single operation. Only the fields
     * needed to build a valid request are returned; Camel-internal metadata and
     * legacy fields are excluded.
     */
    public MinimalOperationSchema generateMinimal(String connector, String operation) {
        return schemaGenerator.generateMinimal(connector, operation);
    }
}
