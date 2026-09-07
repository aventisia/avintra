package camel.harness.core;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConnectorSchemaProperty(
        String type,
        String description,
        List<String> required,
        @JsonProperty("properties") Map<String, ConnectorSchemaProperty> nestedProperties,
        String defaultValue,
        List<String> enumValues) {

    public static ConnectorSchemaProperty objectProperty(String description,
                                                         List<String> required,
                                                         Map<String, ConnectorSchemaProperty> nestedProperties) {
        return new ConnectorSchemaProperty("object", description, required, nestedProperties, null, null);
    }

    public static ConnectorSchemaProperty objectProperty(String description,
                                                         Map<String, ConnectorSchemaProperty> nestedProperties) {
        return objectProperty(description, null, nestedProperties);
    }
}
