package camel.harness.connectors.m365.mailattachment;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code mailattachment} service family.
 */
class MailAttachmentServiceTest extends M365ServiceTestSupport {

    @Test
    void addIsDelegate() {
        M365Action action = actions.require("mailattachment.add");
        assertEquals(true, action.hasDelegate());
        assertEquals("mailattachment", action.delegate());
        assertEquals("direct:m365.mailattachment.add", resolveRoute("mailattachment.add"));
    }

    @Test
    void downloadUsesValuePath() {
        M365Action action = actions.require("mailattachment.download");
        assertEquals("/users/{userId}/messages/{messageId}/attachments/{attachmentId}/$value", action.path());
    }

    @Test
    void listIsPaginated() {
        M365Action action = actions.require("mailattachment.list");
        assertEquals(true, action.paginated());
    }

    @Test
    void getDeclaresAllPathParams() {
        M365Action action = actions.require("mailattachment.get");
        assertEquals(java.util.List.of("userId", "messageId", "attachmentId"), action.pathParams());
    }

    @Test
    void unknownMailAttachmentActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("mailattachment.nonexistent"));
    }

    @Test
    void allMailAttachmentOperationsRegistered() {
        assertTrue(actions.contains("mailattachment.get"));
        assertTrue(actions.contains("mailattachment.list"));
        assertTrue(actions.contains("mailattachment.add"));
        assertTrue(actions.contains("mailattachment.update"));
        assertTrue(actions.contains("mailattachment.delete"));
        assertTrue(actions.contains("mailattachment.download"));
    }
}
