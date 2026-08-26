package camel.harness.connectors.github.webhook;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code webhook} service family and the local
 * {@code webhook.event} actions ({@code receive}, {@code verify},
 * {@code route-event}).
 */
class WebhookServiceTest extends GithubServiceTestSupport {

    @Test
    void createUsesPostOnHooks() {
        GithubAction action = actions.require("webhook.create");
        assertEquals("POST", action.method());
        assertEquals("/repos/{owner}/{repo}/hooks", action.path());
        assertEquals(java.util.List.of("owner", "repo"), action.pathParams());
    }

    @Test
    void createResolvesToDirectRoute() {
        assertEquals("direct:github.webhook.create", resolveRoute("webhook.create"));
    }

    @Test
    void deleteRequiresHookId() {
        GithubAction action = actions.require("webhook.delete");
        assertEquals("/repos/{owner}/{repo}/hooks/{hookId}", action.path());
        assertEquals(java.util.List.of("owner", "repo", "hookId"), action.pathParams());
    }

    @Test
    void getAndPingAreRegistered() {
        GithubAction get = actions.require("webhook.get");
        assertEquals("GET", get.method());
        assertEquals("/repos/{owner}/{repo}/hooks/{hookId}", get.path());

        GithubAction ping = actions.require("webhook.ping");
        assertEquals("POST", ping.method());
        assertEquals("/repos/{owner}/{repo}/hooks/{hookId}/pings", ping.path());
    }

    @Test
    void deliveriesAreRegistered() {
        GithubAction list = actions.require("webhook.list-deliveries");
        assertEquals("GET", list.method());
        assertEquals("/repos/{owner}/{repo}/hooks/{hookId}/deliveries", list.path());
        assertEquals(true, list.paginated());

        GithubAction get = actions.require("webhook.get-delivery");
        assertEquals("/repos/{owner}/{repo}/hooks/{hookId}/deliveries/{deliveryId}", get.path());
        assertEquals(java.util.List.of("owner", "repo", "hookId", "deliveryId"), get.pathParams());

        GithubAction redeliver = actions.require("webhook.redeliver");
        assertEquals("POST", redeliver.method());
        assertEquals("/repos/{owner}/{repo}/hooks/{hookId}/deliveries/{deliveryId}/attempts", redeliver.path());
    }

    @Test
    void webhookRoutesResolve() {
        assertEquals("direct:github.webhook.get", resolveRoute("webhook.get"));
        assertEquals("direct:github.webhook.ping", resolveRoute("webhook.ping"));
        assertEquals("direct:github.webhook.list-deliveries", resolveRoute("webhook.list-deliveries"));
        assertEquals("direct:github.webhook.get-delivery", resolveRoute("webhook.get-delivery"));
        assertEquals("direct:github.webhook.redeliver", resolveRoute("webhook.redeliver"));
    }

    @Test
    void eventActionsAreLocalOnly() {
        assertTrue(actions.require("webhook.event.receive").localOnly());
        assertTrue(actions.require("webhook.event.verify").localOnly());
        assertTrue(actions.require("webhook.event.route-event").localOnly());
    }

    @Test
    void eventVerifyResolvesToDirectRoute() {
        assertEquals("direct:github.webhook.event.verify", resolveRoute("webhook.event.verify"));
    }
}
