package camel.harness.connectors.m365.teamschat;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code teamschat}, {@code teamschatmember},
 * {@code teamsmeeting}, and {@code teamscall} service families.
 */
class TeamsChatServiceTest extends M365ServiceTestSupport {

    @Test
    void chatGetMapsToDirectRoute() {
        assertEquals("direct:m365.teamschat.get", resolveRoute("teamschat.get"));
        assertEquals("/chats/{chatId}", actions.require("teamschat.get").path());
    }

    @Test
    void chatListIsPaginated() {
        assertEquals(true, actions.require("teamschat.list").paginated());
    }

    @Test
    void chatMemberAddUsesMembersPath() {
        M365Action action = actions.require("teamschatmember.add");
        assertEquals("/chats/{chatId}/members", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void chatMemberListIsPaginated() {
        assertEquals(true, actions.require("teamschatmember.list").paginated());
    }

    @Test
    void meetingCreateUsesOnlineMeetingsPath() {
        M365Action action = actions.require("teamsmeeting.create");
        assertEquals("/users/{userId}/onlineMeetings", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void meetingCancelIsDelete() {
        M365Action action = actions.require("teamsmeeting.cancel");
        assertEquals("DELETE", action.method());
    }

    @Test
    void callGetMapsToDirectRoute() {
        assertEquals("direct:m365.teamscall.get", resolveRoute("teamscall.get"));
        assertEquals("/communications/calls/{callId}", actions.require("teamscall.get").path());
    }

    @Test
    void unknownTeamsChatActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("teamschat.nonexistent"));
    }

    @Test
    void allTeamsChatOperationsRegistered() {
        assertTrue(actions.contains("teamschat.get"));
        assertTrue(actions.contains("teamschat.list"));
        assertTrue(actions.contains("teamschat.create"));
        assertTrue(actions.contains("teamschat.update"));
        assertTrue(actions.contains("teamschat.delete"));
    }

    @Test
    void allTeamsChatMemberOperationsRegistered() {
        assertTrue(actions.contains("teamschatmember.list"));
        assertTrue(actions.contains("teamschatmember.add"));
        assertTrue(actions.contains("teamschatmember.remove"));
        assertTrue(actions.contains("teamschatmember.update"));
    }

    @Test
    void allTeamsMeetingOperationsRegistered() {
        assertTrue(actions.contains("teamsmeeting.get"));
        assertTrue(actions.contains("teamsmeeting.list"));
        assertTrue(actions.contains("teamsmeeting.create"));
        assertTrue(actions.contains("teamsmeeting.update"));
        assertTrue(actions.contains("teamsmeeting.cancel"));
    }

    @Test
    void allTeamsCallOperationsRegistered() {
        assertTrue(actions.contains("teamscall.get"));
        assertTrue(actions.contains("teamscall.list"));
    }
}
