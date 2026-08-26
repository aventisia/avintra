package camel.harness.core;

import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

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
        @JsonProperty("db") DatabaseConfig db) {

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

    public Map<String, Object> configurationOrEmpty() {
        return configuration == null ? Map.of() : new LinkedHashMap<>(configuration);
    }

    public Map<String, Object> headersOrEmpty() {
        return headers == null ? Map.of() : new LinkedHashMap<>(headers);
    }

    public Object payload() {
        if (payload != null) {
            return payload;
        }
        return body;
    }
}
