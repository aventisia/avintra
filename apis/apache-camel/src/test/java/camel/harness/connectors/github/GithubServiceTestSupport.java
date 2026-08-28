package camel.harness.connectors.github;

import static org.mockito.Mockito.mock;

import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.springframework.core.env.Environment;

import camel.harness.connectors.github.client.GithubClient;
import camel.harness.connectors.github.client.GithubDispatchProcessor;
import camel.harness.connectors.github.service.GithubWebhookService;
import camel.harness.core.ConnectorRequest;

/**
 * Shared support for focused per-service/action GitHub tests. Service tests in
 * sub-packages extend this to resolve {@code direct:github.<service>.<action>}
 * routes and to build a {@link GithubDispatchProcessor} with a mocked client so
 * request building (paths, query params, pagination) can be asserted per action.
 */
public abstract class GithubServiceTestSupport {

    protected final GithubActions actions = new GithubActions();
    protected final org.springframework.core.env.Environment environment =
        mock(org.springframework.core.env.Environment.class);
    protected final GithubConfigurer configurer = new GithubConfigurer(actions, environment);
    protected final GithubWebhookService webhookService = new GithubWebhookService();

    /**
     * Resolves the {@code direct:...} route for the given dotted operation with
     * a minimal configuration (the configurer only needs the operation name).
     */
    protected String resolveRoute(String operation) {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "github", operation,
            Map.of(), null, null, null, null, null);
        return configurer.resolveEndpoint(exchange, request, null);
    }

    /**
     * Builds a dispatcher backed by a mocked {@link GithubClient} so callers can
     * capture the prepared {@link GithubRequest} without an HTTP round trip.
     */
    protected GithubDispatchProcessor dispatcher() {
        return new GithubDispatchProcessor(mock(GithubClient.class), webhookService, mock(Environment.class));
    }

    protected Map<String, Object> config(Object... keyValues) {
        Map<String, Object> config = new LinkedHashMap<>();
        for (int i = 0; i < keyValues.length; i += 2) {
            config.put((String) keyValues[i], keyValues[i + 1]);
        }
        return config;
    }
}
