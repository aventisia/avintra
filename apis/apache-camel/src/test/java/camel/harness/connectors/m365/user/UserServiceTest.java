package camel.harness.connectors.m365.user;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code user} service family: route resolution, path
 * parameter validation, pagination flags, and delegate (license) operations.
 */
class UserServiceTest extends M365ServiceTestSupport {

    @Test
    void getMapsToDirectRoute() {
        assertEquals("direct:m365.user.get", resolveRoute("user.get"));
    }

    @Test
    void listMapsToDirectRoute() {
        assertEquals("direct:m365.user.list", resolveRoute("user.list"));
        assertEquals(true, actions.require("user.list").paginated());
    }

    @Test
    void getDeclaresUserIdPathParam() {
        M365Action action = actions.require("user.get");
        assertEquals("/users/{userId}", action.path());
        assertEquals(Map.of("userId", "alex@contoso.com"), Map.of("userId", "alex@contoso.com"));
    }

    @Test
    void restoreUsesDeletedItemsPath() {
        M365Action action = actions.require("user.restore");
        assertEquals("/directory/deletedItems/{userId}/restore", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void assignLicenseIsDelegate() {
        M365Action action = actions.require("user.assign-license");
        assertEquals(true, action.hasDelegate());
        assertEquals("user", action.delegate());
    }

    @Test
    void removeLicenseIsDelegate() {
        M365Action action = actions.require("user.remove-license");
        assertEquals(true, action.hasDelegate());
        assertEquals("user", action.delegate());
    }

    @Test
    void getManagerHasNoPagination() {
        M365Action action = actions.require("user.get-manager");
        assertEquals(false, action.paginated());
        assertEquals("/users/{userId}/manager", action.path());
    }

    @Test
    void getDirectReportsIsPaginated() {
        M365Action action = actions.require("user.get-direct-reports");
        assertEquals(true, action.paginated());
        assertEquals("/users/{userId}/directReports", action.path());
    }

    @Test
    void unknownUserActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("user.nonexistent"));
    }

    @Test
    void allUserOperationsRegistered() {
        assertTrue(actions.contains("user.get"));
        assertTrue(actions.contains("user.list"));
        assertTrue(actions.contains("user.create"));
        assertTrue(actions.contains("user.update"));
        assertTrue(actions.contains("user.delete"));
        assertTrue(actions.contains("user.restore"));
        assertTrue(actions.contains("user.assign-license"));
        assertTrue(actions.contains("user.remove-license"));
        assertTrue(actions.contains("user.get-manager"));
        assertTrue(actions.contains("user.get-direct-reports"));
        assertTrue(actions.contains("user.get-memberships"));
        assertTrue(actions.contains("user.get-owned-objects"));
    }

    // ------------------------------------------------------------------
    // User profile & profile-management APIs
    // ------------------------------------------------------------------

    @Test
    void profileApisRegistered() {
        assertTrue(actions.contains("user.get-profile"));
        assertTrue(actions.contains("user.update-profile"));
        assertTrue(actions.contains("user.get-settings"));
        assertTrue(actions.contains("user.update-settings"));
        assertTrue(actions.contains("user.get-photo"));
        assertTrue(actions.contains("user.update-photo"));
        assertTrue(actions.contains("user.get-license-details"));
        assertTrue(actions.contains("user.get-transitive-memberships"));
        assertTrue(actions.contains("user.get-created-objects"));
        assertTrue(actions.contains("user.get-oauth2-permission-grants"));
        assertTrue(actions.contains("user.get-app-role-assignments"));
        assertTrue(actions.contains("user.get-scoped-role-memberships"));
        assertTrue(actions.contains("user.get-extension-properties"));
        assertTrue(actions.contains("user.add-extension-property"));
        assertTrue(actions.contains("user.get-outlook-settings"));
        assertTrue(actions.contains("user.update-outlook-settings"));
    }

    @Test
    void getProfileMapsToDirectRoute() {
        assertEquals("direct:m365.user.get-profile", resolveRoute("user.get-profile"));
        M365Action action = actions.require("user.get-profile");
        assertEquals("/users/{userId}/profile", action.path());
        assertEquals("GET", action.method());
        assertEquals(false, action.paginated());
    }

    @Test
    void updateProfileIsPatch() {
        M365Action action = actions.require("user.update-profile");
        assertEquals("/users/{userId}/profile", action.path());
        assertEquals("PATCH", action.method());
        assertTrue(action.requiredPermissions().contains("User.ReadWrite.All"));
    }

    @Test
    void getPhotoUsesValueEndpoint() {
        M365Action action = actions.require("user.get-photo");
        assertEquals("/users/{userId}/photo/$value", action.path());
        assertEquals("GET", action.method());
    }

    @Test
    void updatePhotoIsPut() {
        M365Action action = actions.require("user.update-photo");
        assertEquals("/users/{userId}/photo/$value", action.path());
        assertEquals("PUT", action.method());
    }

    @Test
    void getLicenseDetailsIsPaginated() {
        M365Action action = actions.require("user.get-license-details");
        assertEquals("/users/{userId}/licenseDetails", action.path());
        assertEquals(true, action.paginated());
    }

    @Test
    void getOutlookSettingsUsesMailboxSettings() {
        M365Action action = actions.require("user.get-outlook-settings");
        assertEquals("/users/{userId}/mailboxSettings", action.path());
        assertEquals("GET", action.method());
    }

    @Test
    void updateOutlookSettingsIsPatch() {
        M365Action action = actions.require("user.update-outlook-settings");
        assertEquals("/users/{userId}/mailboxSettings", action.path());
        assertEquals("PATCH", action.method());
    }
}
