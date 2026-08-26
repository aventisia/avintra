package camel.harness.connectors.m365.onedrive;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code onedrive} service family.
 */
class OneDriveServiceTest extends M365ServiceTestSupport {

    @Test
    void getMapsToDirectRoute() {
        assertEquals("direct:m365.onedrive.get", resolveRoute("onedrive.get"));
        assertEquals("/me/drive", actions.require("onedrive.get").path());
    }

    @Test
    void listIsPaginated() {
        assertEquals(true, actions.require("onedrive.list").paginated());
    }

    @Test
    void uploadUsesContentPath() {
        M365Action action = actions.require("onedrive.upload");
        assertEquals("/me/drive/items/{parentId}:/{filename}:/content", action.path());
        assertEquals("PUT", action.method());
    }

    @Test
    void createFolderUsesRootChildren() {
        M365Action action = actions.require("onedrive.create-folder");
        assertEquals("/me/drive/root/children", action.path());
    }

    @Test
    void searchUsesSearchFunction() {
        M365Action action = actions.require("onedrive.search");
        assertEquals("/me/drive/root/search(q='{q}')", action.path());
        assertEquals(java.util.List.of("q"), action.pathParams());
    }

    @Test
    void unknownOneDriveActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("onedrive.nonexistent"));
    }

    @Test
    void allOneDriveOperationsRegistered() {
        assertTrue(actions.contains("onedrive.get"));
        assertTrue(actions.contains("onedrive.list"));
        assertTrue(actions.contains("onedrive.upload"));
        assertTrue(actions.contains("onedrive.download"));
        assertTrue(actions.contains("onedrive.update"));
        assertTrue(actions.contains("onedrive.delete"));
        assertTrue(actions.contains("onedrive.copy"));
        assertTrue(actions.contains("onedrive.move"));
        assertTrue(actions.contains("onedrive.create-folder"));
        assertTrue(actions.contains("onedrive.search"));
    }
}
