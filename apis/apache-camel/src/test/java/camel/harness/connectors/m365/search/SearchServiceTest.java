package camel.harness.connectors.m365.search;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code search} service family.
 */
class SearchServiceTest extends M365ServiceTestSupport {

    @Test
    void allSearchActionsAreDelegates() {
        assertTrue(actions.require("search.mail").hasDelegate());
        assertTrue(actions.require("search.files").hasDelegate());
        assertTrue(actions.require("search.sites").hasDelegate());
        assertTrue(actions.require("search.users").hasDelegate());
        assertTrue(actions.require("search.messages").hasDelegate());
        assertEquals("search", actions.require("search.mail").delegate());
    }

    @Test
    void searchMailMapsToDirectRoute() {
        assertEquals("direct:m365.search.mail", resolveRoute("search.mail"));
    }

    @Test
    void searchFilesMapsToDirectRoute() {
        assertEquals("direct:m365.search.files", resolveRoute("search.files"));
    }

    @Test
    void unknownSearchActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("search.nonexistent"));
    }

    @Test
    void allSearchOperationsRegistered() {
        assertTrue(actions.contains("search.mail"));
        assertTrue(actions.contains("search.files"));
        assertTrue(actions.contains("search.sites"));
        assertTrue(actions.contains("search.users"));
        assertTrue(actions.contains("search.messages"));
    }

    @Test
    void searchActionDelegateMethodNames() {
        assertEquals("mail", actions.require("search.mail").action());
        assertEquals("files", actions.require("search.files").action());
        assertEquals("sites", actions.require("search.sites").action());
        assertEquals("users", actions.require("search.users").action());
        assertEquals("messages", actions.require("search.messages").action());
    }
}
