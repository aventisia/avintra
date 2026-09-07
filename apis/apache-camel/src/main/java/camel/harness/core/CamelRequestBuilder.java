package camel.harness.core;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Converts the structured {@link ConnectorExecuteRequest} (sent by the .NET
 * Cloud Connector service) into the internal flat {@link ConnectorRequest}
 * envelope that existing configurers and dispatchers consume.
 *
 * <p>Mapping rules:</p>
 * <ul>
 *   <li>{@code parameters} + {@code query} + {@code properties} → {@code configuration}</li>
 *   <li>{@code headers} → {@code headers}</li>
 *   <li>{@code body} → {@code payload}</li>
 *   <li>{@code authentication} → {@code auth} (typed {@link AuthConfiguration})</li>
 * </ul>
 *
 * <p>Because the configuration/payload/auth blocks are provided explicitly, the
 * legacy {@code requestFields} reconstruction is not needed.</p>
 */
@Component
public class CamelRequestBuilder {

    /**
     * Builds a flat {@link ConnectorRequest} from the structured execute request.
     */
    public ConnectorRequest build(ConnectorExecuteRequest execute) {
        Map<String, Object> configuration = new LinkedHashMap<>();
        configuration.putAll(execute.parametersOrEmpty());
        configuration.putAll(execute.queryOrEmpty());
        configuration.putAll(execute.propertiesOrEmpty());

        AuthConfiguration auth = buildAuth(execute.authentication());

        return new ConnectorRequest(
                null, null,
                execute.connector(),
                execute.operation(),
                configuration.isEmpty() ? null : configuration,
                auth,
                execute.headersOrEmpty().isEmpty() ? null : execute.headersOrEmpty(),
                execute.body(),
                null,
                null,
                null, null, null, null, null, null, null, null, null);
    }

    /**
     * Maps the structured authentication block to the typed {@link AuthConfiguration}.
     * The credential value object uses the flat auth keys produced by the .NET
     * service (token, username, password, tenantId, clientId, clientSecret,
     * properties).
     */
    private AuthConfiguration buildAuth(ConnectorAuthentication authentication) {
        if (authentication == null) {
            return null;
        }
        String type = authentication.typeOrEmpty();
        if (type.isBlank() || "none".equalsIgnoreCase(type)) {
            return null;
        }

        ConnectorCredential credential = authentication.credential();
        Map<String, Object> value = credential == null ? Map.of() : credential.valueOrEmpty();

        String token = str(value, "token");
        String username = str(value, "username");
        String password = str(value, "password");
        String tenantId = str(value, "tenantId");
        String clientId = str(value, "clientId");
        String clientSecret = str(value, "clientSecret");
        Map<String, String> properties = stringMap(value.get("properties"));

        return new AuthConfiguration(
                type, username, password, token, null, null, clientId, clientSecret,
                null, null, null, tenantId, null, null, null, null, null, null,
                properties);
    }

    private static String str(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value == null ? null : String.valueOf(value);
    }

    @SuppressWarnings("unchecked")
    private static Map<String, String> stringMap(Object value) {
        if (!(value instanceof Map<?, ?> map)) {
            return null;
        }
        Map<String, String> result = new LinkedHashMap<>();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            if (entry.getKey() != null && entry.getValue() != null) {
                result.put(String.valueOf(entry.getKey()), String.valueOf(entry.getValue()));
            }
        }
        return result.isEmpty() ? null : result;
    }
}
