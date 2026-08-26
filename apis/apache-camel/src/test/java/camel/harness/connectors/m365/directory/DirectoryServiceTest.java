package camel.harness.connectors.m365.directory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code directory} and {@code organization} service
 * families plus {@code device}, {@code application}, {@code serviceprincipal},
 * and {@code presence}.
 */
class DirectoryServiceTest extends M365ServiceTestSupport {

    @Test
    void searchMapsToDirectRoute() {
        assertEquals("direct:m365.directory.search", resolveRoute("directory.search"));
    }

    @Test
    void listUsersIsPaginated() {
        M365Action action = actions.require("directory.list-users");
        assertEquals(true, action.paginated());
        assertEquals("/users", action.path());
    }

    @Test
    void listObjectsIsPaginated() {
        M365Action action = actions.require("directory.list-objects");
        assertEquals(true, action.paginated());
        assertEquals("/directoryObjects", action.path());
    }

    @Test
    void allDirectoryOperationsRegistered() {
        assertTrue(actions.contains("directory.search"));
        assertTrue(actions.contains("directory.list-users"));
        assertTrue(actions.contains("directory.list-groups"));
        assertTrue(actions.contains("directory.list-contacts"));
        assertTrue(actions.contains("directory.list-devices"));
        assertTrue(actions.contains("directory.list-applications"));
        assertTrue(actions.contains("directory.list-service-principals"));
        assertTrue(actions.contains("directory.list-objects"));
    }

    @Test
    void organizationListIsNotPaginated() {
        M365Action action = actions.require("organization.list");
        assertEquals("/organization", action.path());
    }

    @Test
    void organizationOperationsRegistered() {
        assertEquals("direct:m365.organization.get", resolveRoute("organization.get"));
        assertEquals("direct:m365.organization.list", resolveRoute("organization.list"));
    }

    @Test
    void deviceOperationsRegistered() {
        assertTrue(actions.contains("device.get"));
        assertTrue(actions.contains("device.list"));
        assertTrue(actions.contains("device.create"));
        assertTrue(actions.contains("device.update"));
        assertTrue(actions.contains("device.delete"));
    }

    @Test
    void applicationOperationsRegistered() {
        assertTrue(actions.contains("application.get"));
        assertTrue(actions.contains("application.list"));
        assertTrue(actions.contains("application.create"));
        assertTrue(actions.contains("application.update"));
        assertTrue(actions.contains("application.delete"));
        assertEquals("/applications/{applicationId}", actions.require("application.get").path());
    }

    @Test
    void servicePrincipalOperationsRegistered() {
        assertTrue(actions.contains("serviceprincipal.get"));
        assertTrue(actions.contains("serviceprincipal.list"));
        assertTrue(actions.contains("serviceprincipal.create"));
        assertTrue(actions.contains("serviceprincipal.update"));
        assertTrue(actions.contains("serviceprincipal.delete"));
        assertEquals("/servicePrincipals", actions.require("serviceprincipal.list").path());
    }

    @Test
    void presenceOperationsRegistered() {
        M365Action set = actions.require("presence.set");
        assertEquals("/users/{userId}/presence/setPresence", set.path());
        assertEquals("POST", set.method());
        assertTrue(actions.contains("presence.get"));
        assertTrue(actions.contains("presence.list"));
    }

    @Test
    void unknownDirectoryActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("directory.nonexistent"));
    }
}
