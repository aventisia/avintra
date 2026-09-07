package camel.harness.core;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Minimal connector summary returned by {@code GET /connectors}. Only the
 * fields a consumer needs to pick a connector are exposed.
 *
 * @param id          stable connector identifier (Camel component name)
 * @param name        human-readable connector name
 * @param description short description, omitted when not useful
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConnectorListItem(
        String id,
        String name,
        String description) {

    public static ConnectorListItem from(ConnectorMetadata metadata) {
        return new ConnectorListItem(
                metadata.name(),
                metadata.name(),
                metadata.description());
    }
}
