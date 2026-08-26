package camel.harness.core;

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
        return build(metadata);
    }

    public Map<String, ConnectorSchema> generateAll() {
        Map<String, ConnectorSchema> result = new LinkedHashMap<>();
        metadataRegistry.all().forEach((name, metadata) -> result.put(name, build(metadata)));
        return result;
    }

    public boolean canGenerate(String connector) {
        return metadataRegistry.forConnector(connector) != null;
    }

    private ConnectorSchema build(ConnectorMetadata metadata) {
        ConnectorSchema schema = ConnectorSchema.base();
        schema = schema.withProperty("connector",
            ConnectorSchema.stringProperty("Connector family name", metadata.name(), metadata.schemes()));
        List<String> operations = metadata.operations();
        schema = schema.withProperty("operation",
            operations == null || operations.isEmpty()
                ? ConnectorSchema.stringProperty("Operation to execute")
                : ConnectorSchema.stringProperty("Operation to execute", null, operations));
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
