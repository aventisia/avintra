package camel.harness.core;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

@Component
public class ConnectorSchemaGenerator {

    private final ConnectorMetadataRegistry metadataRegistry;

    public ConnectorSchemaGenerator(ConnectorMetadataRegistry metadataRegistry) {
        this.metadataRegistry = metadataRegistry;
    }

    public ConnectorSchema generate(String connector) {
        ConnectorMetadata metadata = metadataRegistry.forConnector(connector);
        if (metadata == null) {
            throw new IllegalArgumentException("Unknown connector: " + connector);
        }
        return build(metadata, null);
    }

    /**
     * Generates a minimal request schema for a single operation. The returned
     * schema contains only the fields needed to build a valid request body for
     * {@code POST /connectors/{connector}/operations/{operation}/execute}.
     * Camel-internal metadata and legacy fields are excluded.
     */
    public MinimalOperationSchema generateMinimal(String connector, String operation) {
        ConnectorMetadata metadata = metadataRegistry.forConnector(connector);
        if (metadata == null) {
            throw new IllegalArgumentException("Unknown connector: " + connector);
        }
        if (operation != null && !operation.isBlank() && !metadata.supportsOperation(operation)) {
            throw new IllegalArgumentException(
                "Unsupported operation '" + operation + "' for connector '" + connector + "'");
        }
        return new MinimalOperationSchema(connector, operation, buildMinimalFields(metadata, operation));
    }

    private List<ConnectorOperationField> buildMinimalFields(ConnectorMetadata metadata, String operation) {
        List<ConnectorOperationField> fields = new ArrayList<>();

        // Pinned operation field. The execute endpoint reads the operation from
        // the path, so this is informational; it is still listed as required so
        // consumers can see which operation the schema describes.
        fields.add(new ConnectorOperationField("operation", "string", true,
            operation != null && !operation.isBlank()
                ? "Operation to execute (pinned to " + operation + ")"
                : "Operation to execute"));

        for (String key : metadata.requiredConfig()) {
            fields.add(new ConnectorOperationField(key, "string", true, "Required: " + key));
        }
        for (String key : metadata.optionalConfig()) {
            fields.add(new ConnectorOperationField(key, "string", false, "Optional: " + key));
        }

        boolean hasRequiredAuth = metadata.requiredAuth() != null && !metadata.requiredAuth().isEmpty();
        boolean hasOptionalAuth = metadata.optionalAuth() != null && !metadata.optionalAuth().isEmpty();
        if (hasRequiredAuth || hasOptionalAuth) {
            StringBuilder description = new StringBuilder("Authentication configuration");
            if (hasRequiredAuth) {
                description.append("; required: ").append(String.join(", ", metadata.requiredAuth()));
            }
            if (hasOptionalAuth) {
                description.append("; optional: ").append(String.join(", ", metadata.optionalAuth()));
            }
            fields.add(new ConnectorOperationField("auth", "object", hasRequiredAuth, description.toString()));
        }

        // Optional body for operations that carry a payload.
        fields.add(new ConnectorOperationField("payload", "any", false,
            "Request body or component-specific payload"));
        return fields;
    }

    public Map<String, ConnectorSchema> generateAll() {
        Map<String, ConnectorSchema> result = new LinkedHashMap<>();
        metadataRegistry.all().forEach((name, metadata) -> result.put(name, build(metadata, null)));
        return result;
    }

    private ConnectorSchema build(ConnectorMetadata metadata, String operation) {
        ConnectorSchema schema = ConnectorSchema.base();
        schema = schema.withProperty("connector",
            ConnectorSchema.stringProperty("Connector family name", metadata.name(), metadata.schemes()));
        List<String> operations = metadata.operations();
        if (operation != null && !operation.isBlank()) {
            schema = schema.withProperty("operation",
                ConnectorSchema.stringProperty("Operation to execute", null, List.of(operation)));
        } else {
            schema = schema.withProperty("operation",
                operations == null || operations.isEmpty()
                    ? ConnectorSchema.stringProperty("Operation to execute")
                    : ConnectorSchema.stringProperty("Operation to execute", null, operations));
        }
        schema = schema.withProperty("configuration", configurationSchema(metadata));
        schema = schema.withProperty("auth", authSchema(metadata));
        schema = schema.withProperty("headers", ConnectorSchemaProperty.objectProperty(
            "HTTP-style headers to pass to the Camel exchange", Map.of()));
        schema = schema.withProperty("payload",
            ConnectorSchema.anyProperty("Request body or component-specific payload"));
        schema = schema.withProperty("targetUri",
            ConnectorSchema.stringProperty("Legacy full Camel URI (alternative to connector/configuration)", null, metadata.schemes().stream().map(s -> s + ":...").toList()));
        schema = schema.withProperty("uri",
            ConnectorSchema.stringProperty("Legacy full Camel URI alias for targetUri", null, null));
        schema = schema.withProperty("body",
            ConnectorSchema.anyProperty("Legacy request body alias for payload"));
        schema = schema.withProperty("db", databaseSchema());
        return schema;
    }

    private ConnectorSchemaProperty configurationSchema(ConnectorMetadata metadata) {
        Map<String, ConnectorSchemaProperty> properties = new LinkedHashMap<>();
        List<String> required = metadata.requiredConfig();
        for (String key : required) {
            properties.put(key, ConnectorSchema.stringProperty("Required: " + key));
        }
        for (String key : metadata.optionalConfig()) {
            properties.put(key, ConnectorSchema.stringProperty("Optional: " + key, null, null));
        }
        return ConnectorSchemaProperty.objectProperty(
            "Connector-specific URI and option configuration",
            required == null || required.isEmpty() ? null : required,
            properties);
    }

    private ConnectorSchemaProperty authSchema(ConnectorMetadata metadata) {
        Map<String, ConnectorSchemaProperty> authProperties = new LinkedHashMap<>();
        authProperties.put("type", ConnectorSchema.stringProperty(
            "Authentication type", null,
            List.of("none", "basic", "bearer", "apiKey", "accessToken", "oauth2", "database", "aws", "azure", "gcp")));
        authProperties.put("username", ConnectorSchema.stringProperty("Username for basic auth"));
        authProperties.put("password", ConnectorSchema.stringProperty("Password for basic auth or database"));
        authProperties.put("token", ConnectorSchema.stringProperty("Bearer token or OAuth access token"));
        authProperties.put("refreshToken", ConnectorSchema.stringProperty("OAuth refresh token (oauth2)"));
        authProperties.put("authorizationUrl", ConnectorSchema.stringProperty("OAuth authorization URL (oauth2)"));
        authProperties.put("tokenUrl", ConnectorSchema.stringProperty("OAuth token endpoint URL (oauth2)"));
        authProperties.put("scopes", ConnectorSchema.stringProperty("Space-separated OAuth scopes (oauth2)"));
        authProperties.put("accessKey", ConnectorSchema.stringProperty("AWS access key"));
        authProperties.put("secretKey", ConnectorSchema.stringProperty("AWS secret key"));
        authProperties.put("clientId", ConnectorSchema.stringProperty("OAuth client id"));
        authProperties.put("clientSecret", ConnectorSchema.stringProperty("OAuth client secret"));
        authProperties.put("apiKey", ConnectorSchema.stringProperty("API key"));
        authProperties.put("apiKeyHeader", ConnectorSchema.stringProperty("API key header name", "X-Api-Key", null));
        authProperties.put("region", ConnectorSchema.stringProperty("Cloud region"));
        authProperties.put("tenantId", ConnectorSchema.stringProperty("Azure tenant id"));
        authProperties.put("subscriptionId", ConnectorSchema.stringProperty("Azure subscription id"));
        authProperties.put("projectId", ConnectorSchema.stringProperty("GCP project id"));
        authProperties.put("properties", ConnectorSchemaProperty.objectProperty(
            "Additional auth properties such as brokerUrl, url, saslMechanism", Map.of()));

        List<String> required = metadata.requiredAuth() == null || metadata.requiredAuth().isEmpty()
            ? null : metadata.requiredAuth();
        return ConnectorSchemaProperty.objectProperty(
            "Authentication configuration",
            required,
            authProperties);
    }

    private ConnectorSchemaProperty databaseSchema() {
        Map<String, ConnectorSchemaProperty> properties = new LinkedHashMap<>();
        properties.put("url", ConnectorSchema.stringProperty("JDBC URL, e.g. jdbc:postgresql://localhost/testdb"));
        properties.put("username", ConnectorSchema.stringProperty("Database username"));
        properties.put("password", ConnectorSchema.stringProperty("Database password"));
        return ConnectorSchemaProperty.objectProperty(
            "Legacy database credentials (use auth.type=database instead)",
            List.of("url", "username", "password"),
            properties);
    }
}
