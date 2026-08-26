package camel.harness.connectors.m365.group;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code group} service family: route resolution, path
 * parameter validation, and membership/ownership reference operations.
 */
class GroupServiceTest extends M365ServiceTestSupport {

    @Test
    void getMapsToDirectRoute() {
        assertEquals("direct:m365.group.get", resolveRoute("group.get"));
    }

    @Test
    void listMapsToDirectRoute() {
        assertEquals("direct:m365.group.list", resolveRoute("group.list"));
        assertEquals(true, actions.require("group.list").paginated());
    }

    @Test
    void addMemberUsesRefPath() {
        M365Action action = actions.require("group.add-member");
        assertEquals("/groups/{groupId}/members/$ref", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void removeMemberUsesRefPath() {
        M365Action action = actions.require("group.remove-member");
        assertEquals("/groups/{groupId}/members/{userId}/$ref", action.path());
        assertEquals("DELETE", action.method());
        assertEquals(java.util.List.of("groupId", "userId"), action.pathParams());
    }

    @Test
    void listMembersIsPaginated() {
        M365Action action = actions.require("group.list-members");
        assertEquals(true, action.paginated());
        assertEquals("/groups/{groupId}/members", action.path());
    }

    @Test
    void appRoleAssignmentOperationsRegistered() {
        M365Action add = actions.require("group.add-app-role-assignment");
        assertEquals("/groups/{groupId}/appRoleAssignments", add.path());
        M365Action remove = actions.require("group.remove-app-role-assignment");
        assertEquals("/groups/{groupId}/appRoleAssignments/{appRoleAssignmentId}", remove.path());
    }

    @Test
    void unknownGroupActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("group.nonexistent"));
    }

    @Test
    void allGroupOperationsRegistered() {
        assertTrue(actions.contains("group.get"));
        assertTrue(actions.contains("group.list"));
        assertTrue(actions.contains("group.create"));
        assertTrue(actions.contains("group.update"));
        assertTrue(actions.contains("group.delete"));
        assertTrue(actions.contains("group.add-member"));
        assertTrue(actions.contains("group.remove-member"));
        assertTrue(actions.contains("group.list-members"));
        assertTrue(actions.contains("group.add-owner"));
        assertTrue(actions.contains("group.remove-owner"));
        assertTrue(actions.contains("group.list-owners"));
        assertTrue(actions.contains("group.add-app-role-assignment"));
        assertTrue(actions.contains("group.remove-app-role-assignment"));
    }
}
