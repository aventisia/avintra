package camel.harness.connectors.m365.teams;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code teams}, {@code teamschannel}, {@code teamsmember},
 * and {@code teamsmessage} service families.
 */
class TeamsServiceTest extends M365ServiceTestSupport {

    @Test
    void teamsGetMapsToDirectRoute() {
        assertEquals("direct:m365.teams.get", resolveRoute("teams.get"));
        assertEquals("/teams/{teamId}", actions.require("teams.get").path());
    }

    @Test
    void teamsArchiveUsesArchivePath() {
        M365Action action = actions.require("teams.archive");
        assertEquals("/teams/{teamId}/archive", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void teamsCloneUsesClonePath() {
        M365Action action = actions.require("teams.clone");
        assertEquals("/teams/{teamId}/clone", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void channelGetMapsToDirectRoute() {
        assertEquals("direct:m365.teamschannel.get", resolveRoute("teamschannel.get"));
        assertEquals("/teams/{teamId}/channels/{channelId}", actions.require("teamschannel.get").path());
    }

    @Test
    void memberAddUsesMembersPath() {
        M365Action action = actions.require("teamsmember.add");
        assertEquals("/teams/{teamId}/members", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void messageSendUsesMessagesPath() {
        M365Action action = actions.require("teamsmessage.send");
        assertEquals("/teams/{teamId}/channels/{channelId}/messages", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void messageReplyUsesRepliesPath() {
        M365Action action = actions.require("teamsmessage.reply");
        assertEquals("/teams/{teamId}/channels/{channelId}/messages/{messageId}/replies", action.path());
    }

    @Test
    void unknownTeamsActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("teams.nonexistent"));
    }

    @Test
    void allTeamsOperationsRegistered() {
        assertTrue(actions.contains("teams.get"));
        assertTrue(actions.contains("teams.list"));
        assertTrue(actions.contains("teams.create"));
        assertTrue(actions.contains("teams.update"));
        assertTrue(actions.contains("teams.delete"));
        assertTrue(actions.contains("teams.archive"));
        assertTrue(actions.contains("teams.unarchive"));
        assertTrue(actions.contains("teams.clone"));
    }

    @Test
    void allTeamsChannelOperationsRegistered() {
        assertTrue(actions.contains("teamschannel.get"));
        assertTrue(actions.contains("teamschannel.list"));
        assertTrue(actions.contains("teamschannel.create"));
        assertTrue(actions.contains("teamschannel.update"));
        assertTrue(actions.contains("teamschannel.delete"));
        assertTrue(actions.contains("teamschannel.archive"));
        assertTrue(actions.contains("teamschannel.unarchive"));
    }

    @Test
    void allTeamsMemberOperationsRegistered() {
        assertTrue(actions.contains("teamsmember.get"));
        assertTrue(actions.contains("teamsmember.list"));
        assertTrue(actions.contains("teamsmember.add"));
        assertTrue(actions.contains("teamsmember.update"));
        assertTrue(actions.contains("teamsmember.remove"));
    }

    @Test
    void allTeamsMessageOperationsRegistered() {
        assertTrue(actions.contains("teamsmessage.get"));
        assertTrue(actions.contains("teamsmessage.list"));
        assertTrue(actions.contains("teamsmessage.send"));
        assertTrue(actions.contains("teamsmessage.update"));
        assertTrue(actions.contains("teamsmessage.delete"));
        assertTrue(actions.contains("teamsmessage.reply"));
        assertTrue(actions.contains("teamsmessage.forward"));
    }
}
