package camel.harness.core;

import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Resolved authentication block for a structured connector execution request.
 *
 * <p>The credential value is the decoded credential object produced by the .NET
 * Cloud Connector service. The harness maps it to the internal flat auth fields
 * (token, username, password, tenantId, clientId, clientSecret, properties)
 * based on the authentication type.</p>
 *
 * @param type       authentication type (accessToken, basic, database,
 *                   client_credentials, none, ...)
 * @param credential the decoded credential (name + value object)
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ConnectorAuthentication(
        @JsonProperty("type") String type,
        @JsonProperty("credential") ConnectorCredential credential) {

    public String typeOrEmpty() {
        return type == null ? "" : type;
    }
}
