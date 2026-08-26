package camel.harness.core;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConnectorSchema(
        String $schema,
        String type,
        String title,
        String description,
        List<String> required,
        Map<String, ConnectorSchemaProperty> properties,
        Map<String, ConnectorSchemaDefinition> $defs) {

    public static ConnectorSchema base() {
        return new ConnectorSchema(
                "https://json-schema.org/draft/2020-12/schema",
                "object",
                "ConnectorRequest",
                "Request payload for the Camel connector harness",
                List.of("connector", "operation", "configuration"),
                new LinkedHashMap<>(),
                new LinkedHashMap<>());
    }

    public ConnectorSchema withProperty(String name, ConnectorSchemaProperty property) {
        Map<String, ConnectorSchemaProperty> updated = new LinkedHashMap<>(properties);
        updated.put(name, property);
        return new ConnectorSchema($schema, type, title, description, required, updated, $defs);
    }

    public ConnectorSchema withDef(String name, ConnectorSchemaDefinition def) {
        Map<String, ConnectorSchemaDefinition> updated = new LinkedHashMap<>($defs);
        updated.put(name, def);
        return new ConnectorSchema($schema, type, title, description, required, properties, updated);
    }

    public static ConnectorSchemaProperty stringProperty(String description, String defaultValue, List<String> enumValues) {
        return new ConnectorSchemaProperty("string", description, null, null, defaultValue, enumValues, null, null);
    }

    public static ConnectorSchemaProperty stringProperty(String description) {
        return stringProperty(description, null, null);
    }

    public static ConnectorSchemaProperty anyProperty(String description) {
        return new ConnectorSchemaProperty(null, description, null, null, null, null, null, null);
    }

    public static ConnectorSchemaProperty booleanProperty(String description, Boolean defaultValue) {
        return new ConnectorSchemaProperty("boolean", description, null, null, null, null, defaultValue, null);
    }

    public static ConnectorSchemaProperty integerProperty(String description) {
        return new ConnectorSchemaProperty("integer", description, null, null, null, null, null, null);
    }

    public static ConnectorSchemaProperty arrayProperty(String description, ConnectorSchemaProperty items) {
        return new ConnectorSchemaProperty("array", description, null, null, null, null, null, items);
    }
}
