package camel.harness.connectors.m365.mail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code mail} service family: route resolution, path
 * parameter validation, and delegate (send) operations.
 */
class MailServiceTest extends M365ServiceTestSupport {

    @Test
    void sendIsDelegate() {
        M365Action action = actions.require("mail.send");
        assertEquals(true, action.hasDelegate());
        assertEquals("mail", action.delegate());
        assertEquals("direct:m365.mail.send", resolveRoute("mail.send"));
    }

    @Test
    void getMapsToDirectRoute() {
        assertEquals("direct:m365.mail.get", resolveRoute("mail.get"));
        M365Action action = actions.require("mail.get");
        assertEquals("/users/{userId}/messages/{messageId}", action.path());
    }

    @Test
    void listMapsToDirectRoute() {
        assertEquals("direct:m365.mail.list", resolveRoute("mail.list"));
        assertEquals(true, actions.require("mail.list").paginated());
    }

    @Test
    void moveUsesMoveActionPath() {
        M365Action action = actions.require("mail.move");
        assertEquals("/users/{userId}/messages/{messageId}/move", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void replyAllUsesReplyAllPath() {
        M365Action action = actions.require("mail.reply-all");
        assertEquals("/users/{userId}/messages/{messageId}/replyAll", action.path());
    }

    @Test
    void sendDraftUsesSendPath() {
        M365Action action = actions.require("mail.send-draft");
        assertEquals("/users/{userId}/messages/{messageId}/send", action.path());
    }

    @Test
    void unknownMailActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("mail.nonexistent"));
    }

    @Test
    void allMailOperationsRegistered() {
        assertTrue(actions.contains("mail.send"));
        assertTrue(actions.contains("mail.get"));
        assertTrue(actions.contains("mail.list"));
        assertTrue(actions.contains("mail.create"));
        assertTrue(actions.contains("mail.update"));
        assertTrue(actions.contains("mail.delete"));
        assertTrue(actions.contains("mail.move"));
        assertTrue(actions.contains("mail.copy"));
        assertTrue(actions.contains("mail.forward"));
        assertTrue(actions.contains("mail.reply"));
        assertTrue(actions.contains("mail.reply-all"));
        assertTrue(actions.contains("mail.create-draft"));
        assertTrue(actions.contains("mail.send-draft"));
    }
}
