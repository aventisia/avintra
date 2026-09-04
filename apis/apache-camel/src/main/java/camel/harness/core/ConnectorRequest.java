package camel.harness.core;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Flat connector request envelope sent by the WorkspaceAPI proxy.
 *
 * <p>The public contract now merges legacy {@code configuration} and
 * {@code payload} into a single top-level {@code payload} object, and flattens
 * {@code auth} to top-level auth fields. The helper methods on this record
 * reconstruct the legacy views ({@link #configurationOrEmpty()}, {@link #payload()},
 * {@link #auth()}) that existing configurers and processors still consume.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConnectorRequest(
        @JsonProperty("targetUri") String targetUri,
        @JsonAlias("uri") @JsonProperty("uri") String uri,
        @JsonProperty("connector") String connector,
        @JsonProperty("operation") String operation,
        @JsonProperty("configuration") Map<String, Object> configuration,
        @JsonProperty("auth") AuthConfiguration auth,
        @JsonProperty("headers") Map<String, Object> headers,
        @JsonProperty("payload") Object payload,
        @JsonProperty("body") Object body,
        @JsonProperty("db") DatabaseConfig db,
        @JsonProperty("authtype") String authtype,
        @JsonProperty("token") String token,
        @JsonProperty("username") String username,
        @JsonProperty("password") String password,
        @JsonProperty("tenantId") String tenantId,
        @JsonProperty("clientId") String clientId,
        @JsonProperty("clientSecret") String clientSecret,
        @JsonProperty("properties") Map<String, String> properties,
        @JsonProperty("requestFields") List<ConnectorRequestField> requestFields) {

    /**
     * Backward-compatible factory for tests and inline callers that still build
     * the legacy 10-argument envelope. All new flat fields default to null.
     */
    public static ConnectorRequest legacy(String targetUri, String uri, String connector,
            String operation, Map<String, Object> configuration, AuthConfiguration auth,
            Map<String, Object> headers, Object payload, Object body, DatabaseConfig db) {
        return new ConnectorRequest(targetUri, uri, connector, operation, configuration, auth,
                headers, payload, body, db, null, null, null, null, null, null, null, null, null);
    }

    public String targetUri() {
        return targetUri != null ? targetUri : uri;
    }

    public String connectorName(String fallback) {
        if (connector != null && !connector.isBlank()) {
            return connector;
        }
        return fallback;
    }

    public String operationName() {
        return operation;
    }

    public Map<String, Object> headersOrEmpty() {
        return headers == null ? Map.of() : new LinkedHashMap<>(headers);
    }

    /**
     * Returns the merged flat payload object. If the new flat contract was used,
     * this is the single top-level {@code payload}; otherwise it falls back to
     * the legacy {@code payload} or {@code body}.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> payloadMap() {
        Object value = payload != null ? payload : body;
        if (value instanceof Map<?, ?> map) {
            return new LinkedHashMap<>((Map<String, Object>) map);
        }
        return new LinkedHashMap<>();
    }

    /**
     * Reconstructs the legacy configuration view from the flat payload using
     * per-operation field classification. Fields marked as {@code config} go here.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> configurationOrEmpty() {
        if (configuration != null && !configuration.isEmpty()) {
            return new LinkedHashMap<>(configuration);
        }

        Map<String, Object> payloadMap = payloadMap();
        if (payloadMap.isEmpty()) {
            return Map.of();
        }

        Map<String, Object> config = new LinkedHashMap<>();
        Map<String, String> locations = requestFieldLocations();
        for (Map.Entry<String, Object> entry : payloadMap.entrySet()) {
            String location = locations.getOrDefault(entry.getKey(), "config");
            if ("config".equals(location)) {
                config.put(entry.getKey(), entry.getValue());
            }
        }
        return config;
    }

    /**
     * Reconstructs the legacy payload/body view. Fields marked as {@code body}
     * go here; if no body fields are classified, the entire flat payload is used
     * for backward compatibility.
     */
    @SuppressWarnings("unchecked")
    public Object payload() {
        if (payload != null && !(payload instanceof Map)) {
            return payload;
        }

        Map<String, Object> payloadMap = payloadMap();
        if (payloadMap.isEmpty()) {
            return body != null ? body : payload;
        }

        Map<String, String> locations = requestFieldLocations();
        boolean hasBodyFields = locations.values().stream().anyMatch("body"::equals);
        if (!hasBodyFields) {
            return payload != null ? payload : body;
        }

        Map<String, Object> bodyMap = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : payloadMap.entrySet()) {
            if ("body".equals(locations.get(entry.getKey()))) {
                bodyMap.put(entry.getKey(), entry.getValue());
            }
        }
        // If only one field is classified as body, return its value directly to
        // match the legacy behaviour where bodyField was a single named field.
        if (bodyMap.size() == 1) {
            return bodyMap.values().iterator().next();
        }
        return bodyMap.isEmpty() ? payload : bodyMap;
    }

    /**
     * Reconstructs the legacy {@link AuthConfiguration} from the flat auth fields.
     */
    public AuthConfiguration auth() {
        if (auth != null) {
            return auth;
        }

        String effectiveType = authtype;
        if (effectiveType == null || effectiveType.isBlank()) {
            return null;
        }

        return new AuthConfiguration(
                effectiveType,
                username,
                password,
                token,
                null,
                null,
                clientId,
                clientSecret,
                null,
                null,
                null,
                tenantId,
                null,
                null,
                null,
                null,
                null,
                null,
                properties);
    }

    private Map<String, String> requestFieldLocations() {
        Map<String, String> locations = new LinkedHashMap<>();
        if (requestFields != null) {
            for (ConnectorRequestField field : requestFields) {
                if (field.name() != null && field.location() != null) {
                    locations.put(field.name(), field.location().toLowerCase());
                }
            }
        }
        return locations;
    }
}

