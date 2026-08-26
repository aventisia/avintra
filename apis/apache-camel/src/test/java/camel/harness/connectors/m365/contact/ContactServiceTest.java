package camel.harness.connectors.m365.contact;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code contact} service family.
 */
class ContactServiceTest extends M365ServiceTestSupport {

    @Test
    void getMapsToDirectRoute() {
        assertEquals("direct:m365.contact.get", resolveRoute("contact.get"));
        assertEquals("/users/{userId}/contacts/{contactId}", actions.require("contact.get").path());
    }

    @Test
    void listIsPaginated() {
        assertEquals(true, actions.require("contact.list").paginated());
    }

    @Test
    void createUsesContactsPath() {
        M365Action action = actions.require("contact.create");
        assertEquals("POST", action.method());
        assertEquals("/users/{userId}/contacts", action.path());
    }

    @Test
    void unknownContactActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("contact.nonexistent"));
    }

    @Test
    void allContactOperationsRegistered() {
        assertTrue(actions.contains("contact.get"));
        assertTrue(actions.contains("contact.list"));
        assertTrue(actions.contains("contact.create"));
        assertTrue(actions.contains("contact.update"));
        assertTrue(actions.contains("contact.delete"));
    }
}
