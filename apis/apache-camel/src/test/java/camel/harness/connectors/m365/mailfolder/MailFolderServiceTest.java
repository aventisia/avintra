package camel.harness.connectors.m365.mailfolder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code mailfolder} service family.
 */
class MailFolderServiceTest extends M365ServiceTestSupport {

    @Test
    void getMapsToDirectRoute() {
        assertEquals("direct:m365.mailfolder.get", resolveRoute("mailfolder.get"));
        M365Action action = actions.require("mailfolder.get");
        assertEquals("/users/{userId}/mailFolders/{mailFolderId}", action.path());
    }

    @Test
    void listIsPaginated() {
        M365Action action = actions.require("mailfolder.list");
        assertEquals(true, action.paginated());
        assertEquals("/users/{userId}/mailFolders", action.path());
    }

    @Test
    void createUsesMailFoldersPath() {
        M365Action action = actions.require("mailfolder.create");
        assertEquals("POST", action.method());
        assertEquals("/users/{userId}/mailFolders", action.path());
    }

    @Test
    void unknownMailFolderActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("mailfolder.nonexistent"));
    }

    @Test
    void allMailFolderOperationsRegistered() {
        assertTrue(actions.contains("mailfolder.get"));
        assertTrue(actions.contains("mailfolder.list"));
        assertTrue(actions.contains("mailfolder.create"));
        assertTrue(actions.contains("mailfolder.update"));
        assertTrue(actions.contains("mailfolder.delete"));
    }
}
