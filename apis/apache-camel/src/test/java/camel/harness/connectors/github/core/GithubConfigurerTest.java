package camel.harness.connectors.github.core;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubActions;
import camel.harness.connectors.github.GithubConfigurer;
import camel.harness.core.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

class GithubConfigurerTest {

    private final GithubActions actions = new GithubActions();
    private final GithubConfigurer configurer =
        new GithubConfigurer(actions, org.mockito.Mockito.mock(org.springframework.core.env.Environment.class));

    @Test
    void mapsOperationToDirectRoute() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "github", "repository.create",
            Map.of("owner", "acme", "repo", "demo"), null, null, null, null, null);
        String uri = configurer.resolveEndpoint(exchange, request, null);
        assertEquals("direct:github.repository.create", uri);
        GithubAction action = exchange.getProperty(GithubConfigurer.PROP_ACTION, GithubAction.class);
        assertEquals("repository.create", action.operation());
    }

    @Test
    void supportsServiceAndActionConfig() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        Map<String, Object> config = new LinkedHashMap<>();
        config.put("service", "pullrequest");
        config.put("action", "merge");
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "github", null, config,
            null, null, null, null, null);
        assertEquals("direct:github.pullrequest.merge",
            configurer.resolveEndpoint(exchange, request, null));
    }

    @Test
    void missingOperationThrows() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "github", null,
            Map.of(), null, null, null, null, null);
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> configurer.resolveEndpoint(exchange, request, null));
        assertTrue(ex.getMessage().contains("operation"));
    }

    @Test
    void unknownOperationThrows() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "github", "unknown.action",
            Map.of(), null, null, null, null, null);
        assertThrows(IllegalArgumentException.class,
            () -> configurer.resolveEndpoint(exchange, request, null));
    }

    @Test
    void localActionsResolveWithoutBaseUrl() {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = ConnectorRequest.legacy(null, null, "github", "webhook.event.verify",
            Map.of(), null, null, null, null, null);
        assertEquals("direct:github.webhook.event.verify",
            configurer.resolveEndpoint(exchange, request, null));
    }
}
