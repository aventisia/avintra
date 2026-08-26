package camel.harness.core;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConnectorSchemaDefinition(
        String type,
        String description,
        List<String> required,
        @JsonProperty("properties") Map<String, ConnectorSchemaProperty> properties) {
}
