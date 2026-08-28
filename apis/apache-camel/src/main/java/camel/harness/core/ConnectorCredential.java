package camel.harness.core;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Decoded credential carried in a structured connector execution request.
 *
 * @param name  the credential name (from the common credential service)
 * @param value the decoded credential object (e.g. {AccessToken: "..."} or
 *              {Username: "...", Password: "..."})
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConnectorCredential(
        @JsonProperty("name") String name,
        @JsonProperty("value") Map<String, Object> value) {

    public Map<String, Object> valueOrEmpty() {
        return value == null ? Map.of() : value;
    }
}
