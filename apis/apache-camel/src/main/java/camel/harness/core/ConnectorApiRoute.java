package camel.harness.core;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.camel.ConsumerTemplate;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.apache.camel.ProducerTemplate;
import org.apache.camel.builder.RouteBuilder;
import org.apache.camel.model.rest.RestBindingMode;
import org.springframework.stereotype.Component;

@Component
public class ConnectorApiRoute extends RouteBuilder {
    private final ObjectMapper objectMapper;
    private final ConnectorMetadataRegistry metadataRegistry;
    private final ConnectorSchemaGenerator schemaGenerator;
    private final ConnectorOperationSchemaGenerator operationSchemaGenerator;
    private final List<ConnectorConfigurer> configurers;
    private final CamelRequestBuilder requestBuilder;

    public ConnectorApiRoute(ObjectMapper objectMapper,
                              ConnectorMetadataRegistry metadataRegistry,
                              ConnectorSchemaGenerator schemaGenerator,
                              ConnectorOperationSchemaGenerator operationSchemaGenerator,
                              List<ConnectorConfigurer> configurers,
                              CamelRequestBuilder requestBuilder) {
        this.objectMapper = objectMapper;
        this.metadataRegistry = metadataRegistry;
        this.schemaGenerator = schemaGenerator;
        this.operationSchemaGenerator = operationSchemaGenerator;
        this.configurers = configurers;
        this.requestBuilder = requestBuilder;
    }

    @Override
    public void configure() {
        onException(Exception.class)
            .handled(true)
            .process(errorResponse());

        restConfiguration()
            .component("platform-http")
            .bindingMode(RestBindingMode.off);

        rest("/connectors")
            .get("/")
            .produces("application/json")
            .to("direct:connector-list");

        rest("/connectors")
            .post("/execute")
            .produces("application/json")
            .to("direct:connector-execute");

        rest("/connectors")
            .post("/{connector}")
            .produces("application/json")
            .to("direct:connector");

        rest("/connectors")
            .get("/{connector}/schema")
            .produces("application/json")
            .to("direct:connector-schema");

        rest("/connectors")
            .get("/{connector}/operations")
            .produces("application/json")
            .to("direct:connector-operations");

        rest("/connectors")
            .get("/{connector}/operations/{operation}/schema")
            .produces("application/json")
            .to("direct:connector-operation-schema");

        rest("/connectors")
            .post("/{connector}/operations/{operation}/execute")
            .produces("application/json")
            .to("direct:connector-operation-execute");

        rest("/connectors")
            .get("/schemas")
            .produces("application/json")
            .to("direct:connector-schemas");

        from("direct:connector-list")
            .process(connectorList());

        from("direct:connector-execute")
            .process(prepareExecuteRequest())
            .choice()
                .when(exchangeProperty("consumerHandled").isEqualTo(true))
                    .process(successResponse())
                .otherwise()
                    .toD("${exchangeProperty.targetUri}")
                    .process(successResponse());

        from("direct:connector")
            .process(prepareRequest())
            .choice()
                .when(exchangeProperty("consumerHandled").isEqualTo(true))
                    .process(successResponse())
                .otherwise()
                    .toD("${exchangeProperty.targetUri}")
                    .process(successResponse());

        from("direct:connector-schema")
            .process(connectorSchema());

        from("direct:connector-operations")
            .process(connectorOperations());

        from("direct:connector-operation-schema")
            .process(connectorOperationSchema());

        from("direct:connector-operation-execute")
            .process(prepareFlatExecuteRequest())
            .choice()
                .when(exchangeProperty("consumerHandled").isEqualTo(true))
                    .process(successResponse())
                .otherwise()
                    .toD("${exchangeProperty.targetUri}")
                    .process(successResponse());

        from("direct:connector-schemas")
            .process(allConnectorSchemas());
    }

    /**
     * Converts the structured {@link ConnectorExecuteRequest} into the internal
     * flat {@link ConnectorRequest} envelope and reuses the standard
     * {@link #prepareRequest()} dispatch flow.
     */
    private Processor prepareExecuteRequest() {
        return exchange -> {
            ConnectorExecuteRequest execute = objectMapper.readValue(
                exchange.getMessage().getBody(String.class), ConnectorExecuteRequest.class);
            if (execute == null || execute.connector() == null || execute.connector().isBlank()) {
                throw new IllegalArgumentException("connector is required in the execute request");
            }
            ConnectorRequest request = requestBuilder.build(execute);
            exchange.getMessage().setBody(objectMapper.writeValueAsString(request));
            prepareRequest().process(exchange);
        };
    }

    /**
     * Converts a flat operation-execute request body (exactly the fields defined
     * by the minimal operation schema) into the internal {@link ConnectorRequest}
     * envelope and reuses the standard {@link #prepareRequest()} dispatch flow.
     *
     * <p>The connector and operation come from the REST path variables. The body
     * is a flat JSON object whose fields map to the connector configuration; an
     * optional nested {@code auth} object and {@code payload} field are extracted
     * so auth and body shaping work unchanged.</p>
     */
    private Processor prepareFlatExecuteRequest() {
        return exchange -> {
            String connector = exchange.getMessage().getHeader("connector", String.class);
            String operation = exchange.getMessage().getHeader("operation", String.class);
            if (connector == null || connector.isBlank() || operation == null || operation.isBlank()) {
                String[] parts = operationPathParts(
                    exchange.getMessage().getHeader(Exchange.HTTP_PATH, String.class));
                if (parts != null) {
                    if (connector == null || connector.isBlank()) {
                        connector = parts[0];
                    }
                    if (operation == null || operation.isBlank()) {
                        operation = parts[1];
                    }
                }
            }
            if (connector == null || connector.isBlank()) {
                throw new IllegalArgumentException("connector is required");
            }
            if (operation == null || operation.isBlank()) {
                throw new IllegalArgumentException("operation is required");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> body = objectMapper.readValue(
                exchange.getMessage().getBody(String.class), Map.class);
            if (body == null) {
                body = new LinkedHashMap<>();
            }

            Map<String, Object> configuration = new LinkedHashMap<>();
            Object payload = null;
            AuthConfiguration auth = null;
            for (Map.Entry<String, Object> entry : body.entrySet()) {
                String key = entry.getKey();
                Object value = entry.getValue();
                if ("auth".equals(key) && value instanceof Map<?, ?> authMap) {
                    auth = authFromMap(authMap);
                } else if ("payload".equals(key) || "body".equals(key)) {
                    // payload and body are aliases for the exchange body; they
                    // must not be injected as URI query parameters.
                    payload = value;
                } else {
                    configuration.put(key, value);
                }
            }

            ConnectorRequest request = new ConnectorRequest(
                null, null, connector, operation, configuration, auth,
                null, payload, null, null, null, null, null, null,
                null, null, null, null, null);
            exchange.getMessage().setBody(objectMapper.writeValueAsString(request));
            prepareRequest().process(exchange);
        };
    }

    /**
     * Builds an {@link AuthConfiguration} from a flat auth map. The map may use
     * either the legacy {@code type} key or the flat {@code authtype} key.
     */
    @SuppressWarnings("unchecked")
    private static AuthConfiguration authFromMap(Map<?, ?> authMap) {
        String type = stringValue(authMap.get("type"));
        if (type == null || type.isBlank()) {
            type = stringValue(authMap.get("authtype"));
        }
        Map<String, String> properties = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : authMap.entrySet()) {
            String key = entry.getKey() == null ? null : entry.getKey().toString();
            if (key == null || "type".equals(key) || "authtype".equals(key)) {
                continue;
            }
            Object value = entry.getValue();
            if (value != null) {
                properties.put(key, value.toString());
            }
        }
        return new AuthConfiguration(
            type,
            stringValue(authMap.get("username")),
            stringValue(authMap.get("password")),
            stringValue(authMap.get("token")),
            stringValue(authMap.get("accessKey")),
            stringValue(authMap.get("secretKey")),
            stringValue(authMap.get("clientId")),
            stringValue(authMap.get("clientSecret")),
            stringValue(authMap.get("apiKey")),
            stringValue(authMap.get("apiKeyHeader")),
            stringValue(authMap.get("region")),
            stringValue(authMap.get("tenantId")),
            stringValue(authMap.get("subscriptionId")),
            stringValue(authMap.get("projectId")),
            stringValue(authMap.get("refreshToken")),
            stringValue(authMap.get("authorizationUrl")),
            stringValue(authMap.get("tokenUrl")),
            stringValue(authMap.get("scopes")),
            properties);
    }

    private static String stringValue(Object value) {
        return value == null ? null : value.toString();
    }

    private Processor prepareRequest() {
        return exchange -> {
            String connector = exchange.getMessage().getHeader("connector", String.class);
            ConnectorRequest request = objectMapper.readValue(
                exchange.getMessage().getBody(String.class), ConnectorRequest.class);
            if (connector == null || connector.isBlank()) {
                connector = connectorFromPath(exchange.getMessage().getHeader(Exchange.HTTP_PATH, String.class));
            }
            connector = request.connectorName(connector);
            if (connector == null || connector.isBlank()) {
                throw new IllegalArgumentException("Use a URL such as /connectors/sql or /connectors/http");
            }

            String targetUri = request.targetUri();
            validateTarget(connector, targetUri);

            ConnectorMetadata metadata = metadataRegistry.forConnector(connector);
            if (metadata == null && targetUri != null) {
                metadata = metadataRegistry.forScheme(targetUri);
            }
            if (metadata != null) {
                metadata.validate(request.configurationOrEmpty(), request.auth());
                if (!metadata.supportsOperation(request.operationName())) {
                    throw new IllegalArgumentException(
                        "Unsupported operation '" + request.operationName() + "' for connector '" + connector + "'");
                }
            }

            exchange.getMessage().removeHeader("CamelHttpPath");
            exchange.getMessage().removeHeader("CamelHttpUri");
            exchange.getMessage().removeHeader("CamelHttpRawPath");
            exchange.getMessage().removeHeader("Content-Type");
            exchange.getMessage().removeHeader("Accept");
            request.headersOrEmpty().forEach((name, value) -> {
                String lower = name.toLowerCase();
                if (!"content-type".equals(lower) && !"accept".equals(lower)) {
                    exchange.getMessage().setHeader(name, value);
                }
            });

            ConnectorConfigurer configurer = findConfigurer(connector, targetUri);
            if (configurer != null) {
                targetUri = configurer.resolveEndpoint(exchange, request, metadata);
            } else {
                GenericConfigurer generic = findGenericConfigurer();
                if (generic != null) {
                    targetUri = generic.resolveEndpoint(exchange, request,
                        metadata != null ? metadata : defaultMetadata(connector));
                } else if (targetUri == null || targetUri.isBlank()) {
                    throw new IllegalArgumentException("targetUri, uri, or configuration is required");
                }
            }

            exchange.setProperty("targetUri", targetUri);
            exchange.setProperty("connector", connector);
            exchange.setProperty("operation", request.operationName());
            Object body = request.payload();
            exchange.getMessage().setBody(normalizeBody(body));

            // Consumer-style operations (read/list/delete/check) are handled here
            // with a one-shot PollingConsumer instead of the producer toD dispatch.
            String operation = request.operationName();
            if (operation != null && isConsumerOperation(operation)) {
                handleConsumerOperation(exchange, connector, targetUri, operation);
            }

            // Positioned append (start or numeric offset) is a read-modify-write:
            // read the existing file, insert the payload at the requested position,
            // then write the combined content back with a producer dispatch.
            if (operation != null && "append".equalsIgnoreCase(operation)
                    && isPositionedAppend(request.configurationOrEmpty())) {
                handlePositionedAppend(exchange, connector, targetUri, request);
                // Mark as handled so the route skips the producer toD dispatch,
                // which would otherwise overwrite the file with only the payload.
                exchange.setProperty("consumerHandled", true);
            }
        };
    }

    private static boolean isPositionedAppend(Map<String, Object> config) {
        Object pos = config.get("appendPosition");
        if (pos == null) {
            return false;
        }
        String position = pos.toString().trim().toLowerCase();
        if (position.isEmpty() || "end".equals(position)) {
            return false;
        }
        if ("start".equals(position)) {
            return true;
        }
        try {
            Integer.parseInt(position);
            return true;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                "appendPosition must be 'start', 'end', or a numeric character offset, but was: " + pos);
        }
    }

    private void handlePositionedAppend(Exchange exchange, String connector, String targetUri,
            ConnectorRequest request) throws Exception {
        String fileName = queryParam(targetUri, "fileName");
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("fileName is required for positioned append");
        }
        String position = request.configurationOrEmpty().get("appendPosition").toString().trim().toLowerCase();
        String payload = exchange.getMessage().getBody(String.class);
        if (payload == null) {
            payload = "";
        }

        // Read the existing file content using the reliable RemoteFileOperations
        // API (ConsumerTemplate.receive is unreliable after a producer write).
        org.apache.camel.component.file.remote.FtpEndpoint<?> endpoint =
            (org.apache.camel.component.file.remote.FtpEndpoint<?>) exchange.getContext().getEndpoint(targetUri);
        org.apache.camel.component.file.remote.RemoteFileOperations<?> operations =
            endpoint.createRemoteFileOperations();
        boolean connected = operations.connect(endpoint.getConfiguration(), exchange);
        if (!connected) {
            throw new IllegalArgumentException("Cannot connect to: " + targetUri);
        }
        String existing;
        try {
            org.apache.camel.component.file.GenericFile<?> file =
                (org.apache.camel.component.file.GenericFile<?>) operations.newGenericFile();
            file.setFileName(fileName);
            file.setFileNameOnly(fileName);
            file.setRelativeFilePath(fileName);
            file.setAbsoluteFilePath(fileName);
            exchange.setProperty(org.apache.camel.component.file.FileComponent.FILE_EXCHANGE_FILE, file);
            boolean retrieved = operations.retrieveFile(fileName, exchange, 0);
            if (!retrieved) {
                existing = "";
            } else {
                Object content = file.getBody();
                if (content instanceof byte[] bytes) {
                    existing = new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
                } else {
                    existing = content == null ? "" : content.toString();
                }
            }
        } finally {
            operations.disconnect();
        }

        // Insert the payload at the requested position.
        String combined;
        if ("start".equals(position)) {
            combined = payload + existing;
        } else {
            int offset = Integer.parseInt(position);
            if (offset < 0) {
                throw new IllegalArgumentException("appendPosition must be >= 0, but was: " + offset);
            }
            if (offset > existing.length()) {
                offset = existing.length();
            }
            combined = existing.substring(0, offset) + payload + existing.substring(offset);
        }

        // Write the combined content back to the same file. The FTP producer's
        // default fileExist is Override, so this replaces the file with the
        // combined content (the URI has no fileExist=Append for positioned append).
        ProducerTemplate producerTemplate = exchange.getContext().createProducerTemplate();
        try {
            exchange.getMessage().setBody(combined);
            producerTemplate.sendBody(targetUri, combined);
        } finally {
            producerTemplate.stop();
        }
        exchange.getMessage().setBody(combined);
    }

    private static boolean isConsumerOperation(String operation) {
        return switch (operation.toLowerCase()) {
            case "read", "list", "delete", "check" -> true;
            default -> false;
        };
    }

    private static Object extractFileBody(Exchange result) throws Exception {
        Object body = result.getMessage().getBody();
        if (body instanceof org.apache.camel.component.file.GenericFile<?> genericFile) {
            Object content = genericFile.getBody();
            if (content instanceof java.io.InputStream) {
                return result.getMessage().getBody(String.class);
            }
            if (content instanceof byte[] bytes) {
                return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
            }
            return content;
        }
        if (body instanceof java.io.InputStream) {
            return result.getMessage().getBody(String.class);
        }
        if (body instanceof byte[] bytes) {
            return new String(bytes, java.nio.charset.StandardCharsets.UTF_8);
        }
        return body;
    }

    private static String queryParam(String uri, String name) {
        int q = uri.indexOf('?');
        if (q < 0) {
            return null;
        }
        for (String pair : uri.substring(q + 1).split("&")) {
            int eq = pair.indexOf('=');
            if (eq > 0 && pair.substring(0, eq).equals(name)) {
                return pair.substring(eq + 1);
            }
        }
        return null;
    }

    private void handleConsumerOperation(Exchange exchange, String connector, String targetUri, String operation)
            throws Exception {
        ConsumerTemplate consumerTemplate = exchange.getContext().createConsumerTemplate();
        try {
            switch (operation.toLowerCase()) {
                case "read" -> {
                    Exchange result = consumerTemplate.receive(targetUri, 5000);
                    if (result == null) {
                        throw new IllegalArgumentException("File not found or directory empty: " + targetUri);
                    }
                    exchange.getMessage().setBody(extractFileBody(result));
                    result.getMessage().getHeaders().forEach((name, value) -> {
                        if (value == null || value instanceof String || value instanceof Number
                            || value instanceof Boolean || value instanceof Character) {
                            exchange.getMessage().setHeader(name, value);
                        }
                    });
                }
                case "list", "check" -> {
                    org.apache.camel.component.file.remote.FtpEndpoint<?> endpoint =
                        (org.apache.camel.component.file.remote.FtpEndpoint<?>) exchange.getContext().getEndpoint(targetUri);
                    org.apache.camel.component.file.remote.RemoteFileOperations<?> operations =
                        endpoint.createRemoteFileOperations();
                    boolean connected = operations.connect(endpoint.getConfiguration(), exchange);
                    if (!connected) {
                        throw new IllegalArgumentException("Cannot connect to: " + targetUri);
                    }
                    try {
                        Object[] files = operations.listFiles();
                        List<String> names = new ArrayList<>();
                        if (files != null) {
                            for (Object file : files) {
                                if (file instanceof org.apache.commons.net.ftp.FTPFile ftpFile) {
                                    if (ftpFile.isFile()) {
                                        names.add(ftpFile.getName());
                                    }
                                } else if (file instanceof org.apache.camel.component.file.GenericFile<?> genericFile) {
                                    String name = genericFile.getFileName();
                                    if (name != null) {
                                        names.add(name);
                                    }
                                }
                            }
                        }
                        if ("check".equalsIgnoreCase(operation)) {
                            exchange.getMessage().setBody(Map.of("connected", true, "files", names));
                        } else {
                            exchange.getMessage().setBody(names);
                        }
                    } finally {
                        operations.disconnect();
                    }
                }
                case "delete" -> {
                    String fileName = queryParam(targetUri, "fileName");
                    if (fileName == null || fileName.isBlank()) {
                        throw new IllegalArgumentException("fileName is required for delete operation");
                    }
                    org.apache.camel.component.file.remote.FtpEndpoint<?> endpoint =
                        (org.apache.camel.component.file.remote.FtpEndpoint<?>) exchange.getContext().getEndpoint(targetUri);
                    org.apache.camel.component.file.remote.RemoteFileOperations<?> operations =
                        endpoint.createRemoteFileOperations();
                    boolean connected = operations.connect(endpoint.getConfiguration(), exchange);
                    if (!connected) {
                        throw new IllegalArgumentException("Cannot connect to: " + targetUri);
                    }
                    try {
                        boolean deleted = operations.deleteFile(fileName);
                        exchange.getMessage().setBody(Map.of("deleted", deleted, "fileName", fileName));
                    } finally {
                        operations.disconnect();
                    }
                }
                default -> throw new IllegalArgumentException("Unsupported consumer operation: " + operation);
            }
            exchange.setProperty("consumerHandled", true);
        } finally {
            consumerTemplate.stop();
        }
    }

    private ConnectorConfigurer findConfigurer(String connector, String targetUri) {
        for (ConnectorConfigurer configurer : configurers) {
            if (configurer.connectorName().equalsIgnoreCase(connector)) {
                return configurer;
            }
        }
        if (targetUri != null) {
            int schemeEnd = targetUri.indexOf(':');
            if (schemeEnd > 0) {
                String scheme = targetUri.substring(0, schemeEnd).toLowerCase();
                for (ConnectorConfigurer configurer : configurers) {
                    if (configurer.connectorName().equalsIgnoreCase(scheme)) {
                        return configurer;
                    }
                }
                // mail alias
                if ("smtp".equals(scheme) || "smtps".equals(scheme)) {
                    for (ConnectorConfigurer configurer : configurers) {
                        if ("mail".equalsIgnoreCase(configurer.connectorName())) {
                            return configurer;
                        }
                    }
                }
            }
        }
        return null;
    }

    private GenericConfigurer findGenericConfigurer() {
        for (ConnectorConfigurer configurer : configurers) {
            if (configurer instanceof GenericConfigurer generic) {
                return generic;
            }
            if (GenericConfigurer.GENERIC_CONNECTOR.equals(configurer.connectorName())) {
                return (GenericConfigurer) configurer;
            }
        }
        return null;
    }

    private ConnectorMetadata defaultMetadata(String connector) {
        return new ConnectorMetadata(connector, "Generic Camel component",
            List.of(connector), List.of(), List.of(), List.of(), List.of(), List.of(),
            List.of("No hand-written metadata available; dispatching generically."), null);
    }

    private Object normalizeBody(Object body) throws Exception {
        if (body instanceof Map || body instanceof Iterable) {
            return objectMapper.writeValueAsString(body);
        }
        return body;
    }

    private Processor successResponse() {
        return exchange -> {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("connector", exchange.getProperty("connector"));
            response.put("operation", exchange.getProperty("operation"));
            Object body = exchange.getMessage().getBody();
            Object responseBody = body instanceof java.io.InputStream
                ? exchange.getMessage().getBody(String.class) : body;
            response.put("data", jsonBody(responseBody));
            response.put("error", null);
            exchange.getMessage().setHeader(Exchange.HTTP_RESPONSE_CODE, 200);
            exchange.getMessage().setHeader(Exchange.CONTENT_TYPE, "application/json");
            exchange.getMessage().setBody(objectMapper.writeValueAsString(response));
        };
    }

    private Processor connectorList() {
        return exchange -> {
            List<ConnectorListItem> connectors = new ArrayList<>();
            metadataRegistry.all().forEach((name, metadata) ->
                connectors.add(ConnectorListItem.from(metadata)));
            exchange.getMessage().setHeader(Exchange.CONTENT_TYPE, "application/json");
            exchange.getMessage().setHeader(Exchange.HTTP_RESPONSE_CODE, 200);
            exchange.getMessage().setBody(objectMapper.writeValueAsString(connectors));
        };
    }

    private Processor connectorOperations() {
        return exchange -> {
            String connector = exchange.getMessage().getHeader("connector", String.class);
            if (connector == null || connector.isBlank()) {
                connector = connectorFromPath(exchange.getMessage().getHeader(Exchange.HTTP_PATH, String.class));
            }
            if (connector == null || connector.isBlank()) {
                throw new IllegalArgumentException("connector is required");
            }
            ConnectorMetadata metadata = metadataRegistry.forConnector(connector);
            if (metadata == null) {
                throw new IllegalArgumentException("Unknown connector: " + connector);
            }
            List<ConnectorOperationItem> operations = new ArrayList<>();
            if (metadata.operations() != null) {
                for (String operation : metadata.operations()) {
                    operations.add(ConnectorOperationItem.from(operation));
                }
            }
            exchange.getMessage().setHeader(Exchange.CONTENT_TYPE, "application/json");
            exchange.getMessage().setHeader(Exchange.HTTP_RESPONSE_CODE, 200);
            exchange.getMessage().setBody(objectMapper.writeValueAsString(operations));
        };
    }

    private Processor connectorSchema() {
        return exchange -> {
            String connector = exchange.getMessage().getHeader("connector", String.class);
            ConnectorSchema schema = schemaGenerator.generate(connector);
            exchange.getMessage().setHeader(Exchange.CONTENT_TYPE, "application/json");
            exchange.getMessage().setHeader(Exchange.HTTP_RESPONSE_CODE, 200);
            exchange.getMessage().setBody(objectMapper.writeValueAsString(schema));
        };
    }

    private Processor allConnectorSchemas() {
        return exchange -> {
            Map<String, ConnectorSchema> schemas = schemaGenerator.generateAll();
            exchange.getMessage().setHeader(Exchange.CONTENT_TYPE, "application/json");
            exchange.getMessage().setHeader(Exchange.HTTP_RESPONSE_CODE, 200);
            exchange.getMessage().setBody(objectMapper.writeValueAsString(schemas));
        };
    }

    private Processor connectorOperationSchema() {
        return exchange -> {
            String connector = exchange.getMessage().getHeader("connector", String.class);
            String operation = exchange.getMessage().getHeader("operation", String.class);
            // Fall back to parsing the HTTP path when the REST DSL did not
            // populate the path-variable headers (platform-http).
            if (connector == null || connector.isBlank() || operation == null || operation.isBlank()) {
                String[] parts = operationPathParts(
                    exchange.getMessage().getHeader(Exchange.HTTP_PATH, String.class));
                if (parts != null) {
                    if (connector == null || connector.isBlank()) {
                        connector = parts[0];
                    }
                    if (operation == null || operation.isBlank()) {
                        operation = parts[1];
                    }
                }
            }
            if (connector == null || connector.isBlank()) {
                throw new IllegalArgumentException("connector is required");
            }
            if (operation == null || operation.isBlank()) {
                throw new IllegalArgumentException("operation is required");
            }
            MinimalOperationSchema schema = operationSchemaGenerator.generateMinimal(connector, operation);
            exchange.getMessage().setHeader(Exchange.CONTENT_TYPE, "application/json");
            exchange.getMessage().setHeader(Exchange.HTTP_RESPONSE_CODE, 200);
            exchange.getMessage().setBody(objectMapper.writeValueAsString(schema));
        };
    }

    /**
     * Extracts {@code [connector, operation]} from a path shaped like
     * {@code /connectors/{connector}/operations/{operation}/schema}. Returns
     * {@code null} when the path does not match that shape.
     */
    private static String[] operationPathParts(String path) {
        if (path == null || path.isBlank()) {
            return null;
        }
        String[] segments = path.split("/");
        for (int i = 0; i < segments.length; i++) {
            if ("operations".equals(segments[i]) && i >= 1 && i + 1 < segments.length) {
                String connector = segments[i - 1];
                String operation = segments[i + 1];
                if (!connector.isBlank() && !operation.isBlank()) {
                    return new String[] { connector, operation };
                }
            }
        }
        return null;
    }

    private Processor errorResponse() {
        return exchange -> {
            Throwable failure = exchange.getProperty(Exchange.EXCEPTION_CAUGHT, Throwable.class);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", false);
            response.put("connector", exchange.getProperty("connector"));
            response.put("operation", exchange.getProperty("operation"));
            response.put("data", null);
            int status = 502;
            String message = "Unknown connector failure";
            String code = "CONNECTOR_FAILURE";
            if (failure != null) {
                code = "CONNECTOR_FAILURE";
                message = failure.getMessage() != null
                    ? failure.getMessage() : failure.getClass().getName();
            }
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("code", code);
            error.put("message", message);
            response.put("error", error);
            exchange.getMessage().setHeader(Exchange.HTTP_RESPONSE_CODE, status);
            exchange.getMessage().setHeader(Exchange.CONTENT_TYPE, "application/json");
            exchange.getMessage().setBody(objectMapper.writeValueAsString(response));
        };
    }

    private void validateTarget(String connector, String targetUri) {
        if (connector == null || connector.isBlank()) {
            throw new IllegalArgumentException("Use a URL such as /connectors/sql or /connectors/http");
        }
        if (targetUri == null || targetUri.isBlank()) {
            return;
        }
        int schemeEnd = targetUri.indexOf(':');
        if (schemeEnd <= 0) {
            throw new IllegalArgumentException("targetUri must contain a valid URI scheme");
        }
        String scheme = targetUri.substring(0, schemeEnd).toLowerCase();
        boolean mailAlias = "mail".equalsIgnoreCase(connector)
            && ("smtp".equalsIgnoreCase(scheme) || "smtps".equalsIgnoreCase(scheme));
        ConnectorMetadata metadata = metadataRegistry.forConnector(connector);
        if (mailAlias || scheme.equalsIgnoreCase(connector)) {
            return;
        }
        if (metadata != null) {
            Set<String> schemes = metadata.schemeSet();
            if (schemes.stream().anyMatch(s -> s.equalsIgnoreCase(scheme))) {
                return;
            }
        }
        // Allow any scheme known to the catalog so generic dispatch works for all ~350 components.
        ConnectorMetadata schemeMetadata = metadataRegistry.forScheme(scheme);
        if (schemeMetadata != null) {
            return;
        }
        throw new IllegalArgumentException(
            "targetUri scheme '" + scheme + "' does not match connector '" + connector + "' or any known Camel scheme");
    }

    private static String connectorFromPath(String path) {
        if (path == null || path.isBlank()) {
            return null;
        }
        int lastSlash = path.lastIndexOf('/');
        return lastSlash >= 0 && lastSlash < path.length() - 1
            ? path.substring(lastSlash + 1) : null;
    }

    private Object jsonBody(Object body) throws Exception {
        if (!(body instanceof String text)) {
            return body;
        }
        String trimmed = text.trim();
        if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
            return body;
        }
        return objectMapper.readTree(trimmed);
    }
}
