package camel.harness.connectors.github.notification;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code notification} service family: {@code list} and
 * {@code mark-read}.
 */
class NotificationServiceTest extends GithubServiceTestSupport {

    @Test
    void listIsRegisteredAndPaginated() {
        GithubAction action = actions.require("notification.list");
        assertEquals("notification.list", action.operation());
        assertEquals("GET", action.method());
        assertEquals("/notifications", action.path());
        assertEquals(true, action.paginated());
        assertEquals(true, action.authRequired());
    }

    @Test
    void listResolvesToDirectRoute() {
        assertEquals("direct:github.notification.list", resolveRoute("notification.list"));
    }

    @Test
    void markReadIsRegisteredAsPut() {
        GithubAction action = actions.require("notification.mark-read");
        assertEquals("mark-read", action.action());
        assertEquals("PUT", action.method());
        assertEquals("/notifications", action.path());
    }

    @Test
    void markReadResolvesToDirectRoute() {
        assertEquals("direct:github.notification.mark-read", resolveRoute("notification.mark-read"));
    }
}
