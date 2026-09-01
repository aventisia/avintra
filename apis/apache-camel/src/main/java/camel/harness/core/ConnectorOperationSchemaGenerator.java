package camel.harness.core;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubActions;
import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365Actions;

/**
 * Generates a per-operation JSON Schema for the rich connectors (m365, github)
 * from their action descriptors, falling back to the family-level schema for
 * everything else.
 */
@Component
public class ConnectorOperationSchemaGenerator {

    private final ConnectorSchemaGenerator schemaGenerator;
    private final M365Actions m365Actions;
    private final GithubActions githubActions;

    public ConnectorOperationSchemaGenerator(ConnectorSchemaGenerator schemaGenerator,
                                            M365Actions m365Actions,
                                            GithubActions githubActions) {
        this.schemaGenerator = schemaGenerator;
        this.m365Actions = m365Actions;
        this.githubActions = githubActions;
    }

    public ConnectorSchema generate(String connector, String operation) {
        String key = connector.toLowerCase();
        if ("m365".equals(key)) {
            M365Action action = m365Actions.require(operation);
            return buildM365(action);
        }
        if ("github".equals(key)) {
            GithubAction action = githubActions.require(operation);
            return buildGithub(action);
        }
        // Dynamic generic path: works for any connector/operation. The operation
        // is validated against the connector metadata and pinned into the schema.
        return schemaGenerator.generate(connector, operation);
    }

    private ConnectorSchema buildM365(M365Action a) {
        ConnectorSchema schema = ConnectorSchema.base();
        schema = schema.withProperty("operation",
            ConnectorSchema.stringProperty("Operation to execute", null, List.of(a.operation())));
        schema = schema.withProperty("method",
            ConnectorSchema.stringProperty("HTTP method", a.method(), null));
        schema = schema.withProperty("path",
            ConnectorSchema.stringProperty("Path template", a.path(), null));
        schema = schema.withProperty("parameters", objectOf(a.pathParams(), true));
        schema = schema.withProperty("query", objectOf(a.queryParams(), false));
        schema = schema.withProperty("inputFields", objectOf(a.inputFields(), false));
        schema = schema.withProperty("outputFields", objectOf(a.outputFields(), false));
        schema = schema.withProperty("requiredPermissions",
            ConnectorSchema.stringProperty("Required Graph permission scopes", null, a.requiredPermissions()));
        schema = schema.withProperty("description",
            ConnectorSchema.stringProperty(a.hasDescription() ? a.description() : a.operation()));
        return schema;
    }

    private ConnectorSchema buildGithub(GithubAction a) {
        ConnectorSchema schema = ConnectorSchema.base();
        schema = schema.withProperty("operation",
            ConnectorSchema.stringProperty("Operation to execute", null, List.of(a.operation())));
        schema = schema.withProperty("method",
            ConnectorSchema.stringProperty("HTTP method", a.method(), null));
        schema = schema.withProperty("path",
            ConnectorSchema.stringProperty("Path template", a.path(), null));
        schema = schema.withProperty("parameters", objectOf(a.pathParams(), true));
        schema = schema.withProperty("query", objectOf(a.queryParams(), false));
        return schema;
    }

    private static ConnectorSchemaProperty objectOf(List<String> names, boolean required) {
        Map<String, ConnectorSchemaProperty> props = new LinkedHashMap<>();
        for (String n : names) {
            props.put(n, ConnectorSchema.stringProperty(n));
        }
        return ConnectorSchemaProperty.objectProperty(
            required ? "Required parameters" : "Optional parameters",
            required ? names : null,
            props);
    }
}
