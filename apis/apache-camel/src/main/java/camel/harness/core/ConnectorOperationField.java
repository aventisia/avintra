package camel.harness.core;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * A single field of a minimal operation request schema. Only the fields needed
 * to build a valid request are exposed; Camel-internal metadata is excluded.
 *
 * @param name        field name as it appears in the request body
 * @param type        JSON type (string, integer, boolean, object, array, any)
 * @param required    whether the field must be present
 * @param description short description, omitted when not useful
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConnectorOperationField(
        String name,
        String type,
        boolean required,
        String description) {
}
