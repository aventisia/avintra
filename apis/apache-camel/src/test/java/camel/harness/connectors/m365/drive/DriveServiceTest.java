package camel.harness.connectors.m365.drive;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code drive}, {@code drivefile}, and
 * {@code drivepermission} service families.
 */
class DriveServiceTest extends M365ServiceTestSupport {

    @Test
    void driveGetMapsToDirectRoute() {
        assertEquals("direct:m365.drive.get", resolveRoute("drive.get"));
        assertEquals("/drives/{driveId}", actions.require("drive.get").path());
    }

    @Test
    void driveListIsPaginated() {
        assertEquals(true, actions.require("drive.list").paginated());
    }

    @Test
    void driveCreateFolderUsesRootChildren() {
        M365Action action = actions.require("drive.create-folder");
        assertEquals("/drives/{driveId}/root/children", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void driveSearchUsesSearchFunction() {
        M365Action action = actions.require("drive.search");
        assertEquals("/drives/{driveId}/root/search(q='{q}')", action.path());
    }

    @Test
    void driveFileUploadUsesContentPath() {
        M365Action action = actions.require("drivefile.upload");
        assertEquals("/drives/{driveId}/items/{parentId}:/{filename}:/content", action.path());
        assertEquals("PUT", action.method());
    }

    @Test
    void driveFileDownloadUsesContentPath() {
        M365Action action = actions.require("drivefile.download");
        assertEquals("/drives/{driveId}/items/{itemId}/content", action.path());
    }

    @Test
    void driveFileListIsPaginated() {
        assertEquals(true, actions.require("drivefile.list").paginated());
    }

    @Test
    void driveFileCreateUploadSessionRegistered() {
        M365Action action = actions.require("drivefile.create-upload-session");
        assertEquals("/drives/{driveId}/items/{parentId}:/{filename}:/createUploadSession", action.path());
    }

    @Test
    void drivePermissionListIsPaginated() {
        assertEquals(true, actions.require("drivepermission.list").paginated());
    }

    @Test
    void drivePermissionGetDeclaresPathParams() {
        M365Action action = actions.require("drivepermission.get");
        assertEquals(java.util.List.of("driveId", "itemId", "permissionId"), action.pathParams());
    }

    @Test
    void unknownDriveActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("drive.nonexistent"));
    }

    @Test
    void allDriveOperationsRegistered() {
        assertTrue(actions.contains("drive.get"));
        assertTrue(actions.contains("drive.list"));
        assertTrue(actions.contains("drive.create-folder"));
        assertTrue(actions.contains("drive.update"));
        assertTrue(actions.contains("drive.delete"));
        assertTrue(actions.contains("drive.copy"));
        assertTrue(actions.contains("drive.move"));
        assertTrue(actions.contains("drive.search"));
        assertTrue(actions.contains("drivefile.get"));
        assertTrue(actions.contains("drivefile.list"));
        assertTrue(actions.contains("drivefile.upload"));
        assertTrue(actions.contains("drivefile.download"));
        assertTrue(actions.contains("drivefile.update"));
        assertTrue(actions.contains("drivefile.delete"));
        assertTrue(actions.contains("drivefile.copy"));
        assertTrue(actions.contains("drivefile.move"));
        assertTrue(actions.contains("drivefile.create-upload-session"));
        assertTrue(actions.contains("drivepermission.get"));
        assertTrue(actions.contains("drivepermission.list"));
        assertTrue(actions.contains("drivepermission.create"));
        assertTrue(actions.contains("drivepermission.update"));
        assertTrue(actions.contains("drivepermission.delete"));
    }
}
