package camel.harness.connectors.m365.auth;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code auth} service family (token retrieval across all
 * supported OAuth 2.0 flows).
 */
class AuthServiceTest extends M365ServiceTestSupport {

    @Test
    void getTokenMapsToDirectRoute() {
        assertEquals("direct:m365.auth.get-token", resolveRoute("auth.get-token"));
    }

    @Test
    void getTokenIsDelegate() {
        M365Action action = actions.require("auth.get-token");
        assertTrue(action.hasDelegate());
        assertEquals("auth", action.delegate());
    }

    @Test
    void getTokenHasNoPathParams() {
        M365Action action = actions.require("auth.get-token");
        assertEquals(false, action.hasPathParams());
        assertEquals("POST", action.method());
    }

    @Test
    void unknownAuthActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("auth.nonexistent"));
    }

    @Test
    void authGetTokenRegistered() {
        assertTrue(actions.contains("auth.get-token"));
    }

    @Test
    void allAuthFlowsRegistered() {
        List<String> expected = List.of(
            "auth.get-token",
            "auth.authorization-code",
            "auth.refresh-token",
            "auth.device-code-start",
            "auth.device-code-poll",
            "auth.on-behalf-of");
        for (String op : expected) {
            assertTrue(actions.contains(op), "missing auth operation: " + op);
            M365Action action = actions.require(op);
            assertTrue(action.hasDelegate(), op + " should be a delegate action");
            assertEquals("auth", action.delegate(), op + " should delegate to the auth service");
            assertEquals("POST", action.method(), op + " should be a POST");
        }
    }

    @Test
    void authFlowsMapToDirectRoutes() {
        assertEquals("direct:m365.auth.authorization-code", resolveRoute("auth.authorization-code"));
        assertEquals("direct:m365.auth.refresh-token", resolveRoute("auth.refresh-token"));
        assertEquals("direct:m365.auth.device-code-start", resolveRoute("auth.device-code-start"));
        assertEquals("direct:m365.auth.device-code-poll", resolveRoute("auth.device-code-poll"));
        assertEquals("direct:m365.auth.on-behalf-of", resolveRoute("auth.on-behalf-of"));
    }
}
