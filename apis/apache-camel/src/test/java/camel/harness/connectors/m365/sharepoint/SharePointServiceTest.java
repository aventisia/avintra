package camel.harness.connectors.m365.sharepoint;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the SharePoint service families: {@code sharepointsite},
 * {@code sharepointlist}, {@code sharepointlistitem}, and {@code sharepointdrive}.
 */
class SharePointServiceTest extends M365ServiceTestSupport {

    @Test
    void siteGetMapsToDirectRoute() {
        assertEquals("direct:m365.sharepointsite.get", resolveRoute("sharepointsite.get"));
        assertEquals("/sites/{siteId}", actions.require("sharepointsite.get").path());
    }

    @Test
    void siteSearchUsesSearchQuery() {
        M365Action action = actions.require("sharepointsite.search");
        assertEquals("/sites?search={q}", action.path());
    }

    @Test
    void listGetMapsToDirectRoute() {
        assertEquals("direct:m365.sharepointlist.get", resolveRoute("sharepointlist.get"));
        assertEquals("/sites/{siteId}/lists/{listId}", actions.require("sharepointlist.get").path());
    }

    @Test
    void listItemCreateUsesItemsPath() {
        M365Action action = actions.require("sharepointlistitem.create");
        assertEquals("/sites/{siteId}/lists/{listId}/items", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void listItemUpdateDeclaresPathParams() {
        M365Action action = actions.require("sharepointlistitem.update");
        assertEquals(java.util.List.of("siteId", "listId", "itemId"), action.pathParams());
    }

    @Test
    void sharePointDriveUploadUsesContentPath() {
        M365Action action = actions.require("sharepointdrive.upload");
        assertEquals("/sites/{siteId}/drive/items/{parentId}:/{filename}:/content", action.path());
        assertEquals("PUT", action.method());
    }

    @Test
    void unknownSharePointActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("sharepointsite.nonexistent"));
    }

    @Test
    void allSharePointSiteOperationsRegistered() {
        assertTrue(actions.contains("sharepointsite.get"));
        assertTrue(actions.contains("sharepointsite.list"));
        assertTrue(actions.contains("sharepointsite.search"));
        assertTrue(actions.contains("sharepointsite.create"));
        assertTrue(actions.contains("sharepointsite.update"));
        assertTrue(actions.contains("sharepointsite.delete"));
    }

    @Test
    void allSharePointListOperationsRegistered() {
        assertTrue(actions.contains("sharepointlist.get"));
        assertTrue(actions.contains("sharepointlist.list"));
        assertTrue(actions.contains("sharepointlist.create"));
        assertTrue(actions.contains("sharepointlist.update"));
        assertTrue(actions.contains("sharepointlist.delete"));
    }

    @Test
    void allSharePointListItemOperationsRegistered() {
        assertTrue(actions.contains("sharepointlistitem.get"));
        assertTrue(actions.contains("sharepointlistitem.list"));
        assertTrue(actions.contains("sharepointlistitem.create"));
        assertTrue(actions.contains("sharepointlistitem.update"));
        assertTrue(actions.contains("sharepointlistitem.delete"));
    }

    @Test
    void allSharePointDriveOperationsRegistered() {
        assertTrue(actions.contains("sharepointdrive.get"));
        assertTrue(actions.contains("sharepointdrive.list"));
        assertTrue(actions.contains("sharepointdrive.upload"));
        assertTrue(actions.contains("sharepointdrive.download"));
        assertTrue(actions.contains("sharepointdrive.update"));
        assertTrue(actions.contains("sharepointdrive.delete"));
        assertTrue(actions.contains("sharepointdrive.copy"));
        assertTrue(actions.contains("sharepointdrive.move"));
    }
}
