package camel.harness.core;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Minimal operation summary returned by
 * {@code GET /connectors/{connector}/operations}. Only the fields a consumer
 * needs to pick an operation are exposed.
 *
 * @param id          stable operation identifier
 * @param name        human-readable operation name
 * @param description short description, omitted when not useful
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConnectorOperationItem(
        String id,
        String name,
        String description) {

    public static ConnectorOperationItem from(String operation) {
        return new ConnectorOperationItem(operation, operation, null);
    }
}
