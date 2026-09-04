package camel.harness.core;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Per-operation field classification used by the flat connector contract to
 * reconstruct legacy {@code configuration} and {@code payload} views.
 *
 * @param name     the field name as it appears in the flat payload
 * @param location either {@code config} (path/query/endpoint parameters) or
 *                 {@code body} (request body content)
 * @param required whether the connector considers this field required
 */
public record ConnectorRequestField(
        @JsonProperty("name") String name,
        @JsonProperty("location") String location,
        @JsonProperty("required") boolean required) {
}
