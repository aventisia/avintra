package camel.harness.connectors.github;

import camel.harness.core.*;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * {@link ConnectorConfigurer} for the {@code github} connector family. It maps a
 * dotted {@code operation} (e.g. {@code repository.create}) to its registered
 * {@link GithubAction} descriptor and returns the {@code direct:github.<service>.<action>}
 * route URI. The resolved action, effective base URL, and request state are
 * attached to the exchange so the target route's dispatcher (and any delegated
 * domain service) can act on them.
 */
@Component
public class GithubConfigurer implements ConnectorConfigurer {

    /** Exchange property holding the resolved {@link GithubAction}. */
    public static final String PROP_ACTION = "githubAction";
    /** Exchange property holding the effective GitHub base URL. */
    public static final String PROP_BASE_URL = "githubBaseUrl";
    /** Exchange property holding the original {@link ConnectorRequest}. */
    public static final String PROP_REQUEST = "connectorRequest";

    private static final String DEFAULT_BASE_URL = "https://api.github.com";

    private final GithubActions actions;
    private final Environment environment;

    public GithubConfigurer(GithubActions actions, Environment environment) {
        this.actions = actions;
        this.environment = environment;
    }

    @Override
    public String connectorName() {
        return "github";
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        Map<String, Object> config = request.configurationOrEmpty();

        // Operation may be supplied as dotted ("repository.create") or split
        // into configuration.service + configuration.action.
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
                "GitHub operation is required, e.g. operation=repository.create (or configuration.service/action)");
        }

        GithubAction action = actions.require(operation);
        exchange.setProperty(PROP_ACTION, action);
        exchange.setProperty(PROP_BASE_URL, effectiveBaseUrl(config.get("baseUrl")));
        exchange.setProperty(PROP_REQUEST, request);
        return action.route();
    }

    private String effectiveBaseUrl(Object configured) {
        if (configured != null && !configured.toString().isBlank()) {
            return stripTrailingSlash(configured.toString());
        }
        if (environment != null) {
            String envValue = environment.getProperty("github.base-url");
            if (envValue != null && !envValue.isBlank()) {
                return stripTrailingSlash(envValue);
            }
        }
        return DEFAULT_BASE_URL;
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
