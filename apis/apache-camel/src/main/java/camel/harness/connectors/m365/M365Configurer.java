package camel.harness.connectors.m365;

import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import camel.harness.core.ConnectorConfigurer;
import camel.harness.core.ConnectorMetadata;
import camel.harness.core.ConnectorRequest;

/**
 * {@link ConnectorConfigurer} for the {@code m365} connector family. It maps a
 * dotted {@code operation} (e.g. {@code user.get}) to its registered
 * {@link M365Action} descriptor and returns the {@code direct:m365.<service>.<action>}
 * route URI. The resolved action, effective base URL, and request state are
 * attached to the exchange so the target route's dispatcher (and any delegated
 * domain service) can act on them.
 */
@Component
public class M365Configurer implements ConnectorConfigurer {

    /** Exchange property holding the resolved {@link M365Action}. */
    public static final String PROP_ACTION = "m365Action";
    /** Exchange property holding the effective Graph base URL. */
    public static final String PROP_BASE_URL = "m365BaseUrl";
    /** Exchange property holding the original {@link ConnectorRequest}. */
    public static final String PROP_REQUEST = "connectorRequest";

    private final M365Actions actions;
    private final Environment environment;

    public M365Configurer(M365Actions actions, Environment environment) {
        this.actions = actions;
        this.environment = environment;
    }

    @Override
    public String connectorName() {
        return "m365";
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        Map<String, Object> config = request.configurationOrEmpty();

        // Operation may be supplied as dotted ("user.get") or split into
        // configuration.service + configuration.action.
        String operation = request.operationName();
        if (operation == null || operation.isBlank()) {
            String service = (String) config.get("service");
            String action = (String) config.get("action");
            if (service != null && action != null) {
                operation = service + "." + action;
            }
        }
        if (operation == null || operation.isBlank()) {
            throw new IllegalArgumentException(
                "M365 operation is required, e.g. operation=user.get (or configuration.service/action)");
        }

        M365Action action = actions.require(operation);
        exchange.setProperty(PROP_ACTION, action);
        exchange.setProperty(PROP_BASE_URL, effectiveBaseUrl(config.get("baseUrl")));
        exchange.setProperty(PROP_REQUEST, request);
        return action.route();
    }

    private String effectiveBaseUrl(Object configured) {
        if (configured != null && !configured.toString().isBlank()) {
            return stripTrailingSlash(configured.toString());
        }
        return M365Defaults.baseUrl(environment);
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
