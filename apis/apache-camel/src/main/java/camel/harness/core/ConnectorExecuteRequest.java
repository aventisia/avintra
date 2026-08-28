package camel.harness.core;

import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Structured connector execution request sent by the .NET Cloud Connector
 * service to {@code POST /api/connectors/execute}.
 *
 * <p>This is the configuration-driven contract: the .NET service maps each
 * connector field to a location (path/query/header/body/property) and sends a
 * generic request. The harness converts it to the internal flat
 * {@link ConnectorRequest} envelope via {@link CamelRequestBuilder} so existing
 * configurers and dispatchers keep working unchanged.</p>
 *
 * @param connector      Camel connector family name (e.g. "github")
 * @param operation      dotted harness operation (e.g. "branch.list")
 * @param authentication resolved authentication block
 * @param parameters     path/endpoint parameters
 * @param query          query parameters
 * @param headers        HTTP headers
 * @param body           request body (object, map, or null)
 * @param properties     connector-specific Camel properties
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConnectorExecuteRequest(
        @JsonProperty("connector") String connector,
        @JsonProperty("operation") String operation,
        @JsonProperty("authentication") ConnectorAuthentication authentication,
        @JsonProperty("parameters") Map<String, Object> parameters,
        @JsonProperty("query") Map<String, Object> query,
        @JsonProperty("headers") Map<String, Object> headers,
        @JsonProperty("body") Object body,
        @JsonProperty("properties") Map<String, Object> properties) {

    public Map<String, Object> parametersOrEmpty() {
        return parameters == null ? Map.of() : new LinkedHashMap<>(parameters);
    }

    public Map<String, Object> queryOrEmpty() {
        return query == null ? Map.of() : new LinkedHashMap<>(query);
    }

    public Map<String, Object> headersOrEmpty() {
        return headers == null ? Map.of() : new LinkedHashMap<>(headers);
    }

    public Map<String, Object> propertiesOrEmpty() {
        return properties == null ? Map.of() : new LinkedHashMap<>(properties);
    }
}
