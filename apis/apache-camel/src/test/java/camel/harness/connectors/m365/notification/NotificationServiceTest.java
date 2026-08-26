package camel.harness.connectors.m365.notification;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code notification}, {@code subscription}, and
 * {@code auditreport} service families.
 */
class NotificationServiceTest extends M365ServiceTestSupport {

    @Test
    void listMapsToDirectRoute() {
        assertEquals("direct:m365.notification.list", resolveRoute("notification.list"));
        assertEquals(true, actions.require("notification.list").paginated());
    }

    @Test
    void markAsReadUsesPatch() {
        M365Action action = actions.require("notification.mark-as-read");
        assertEquals("/users/{userId}/messages/{messageId}", action.path());
        assertEquals("PATCH", action.method());
    }

    @Test
    void subscriptionCreateMapsToDirectRoute() {
        assertEquals("direct:m365.subscription.create", resolveRoute("subscription.create"));
        assertEquals("/subscriptions", actions.require("subscription.create").path());
        assertEquals("POST", actions.require("subscription.create").method());
    }

    @Test
    void subscriptionRenewUsesReauthorizePath() {
        M365Action action = actions.require("subscription.renew");
        assertEquals("/subscriptions/{subscriptionId}/reauthorize", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void subscriptionListIsPaginated() {
        assertEquals(true, actions.require("subscription.list").paginated());
    }

    @Test
    void auditGetAuditLogMapsToDirectRoute() {
        assertEquals("direct:m365.auditreport.get-audit-log", resolveRoute("auditreport.get-audit-log"));
        assertEquals("/auditLogs/directoryAudits", actions.require("auditreport.get-audit-log").path());
        assertEquals(true, actions.require("auditreport.get-audit-log").paginated());
    }

    @Test
    void auditGetSignInReportMapsToDirectRoute() {
        assertEquals("direct:m365.auditreport.get-sign-in-report", resolveRoute("auditreport.get-sign-in-report"));
        assertEquals("/auditLogs/signIns", actions.require("auditreport.get-sign-in-report").path());
    }

    @Test
    void auditUsageReportsUsePeriodPathParam() {
        M365Action action = actions.require("auditreport.get-user-usage");
        assertEquals("/reports/getEmailActivityUserDetail(period='{period}')", action.path());
        assertEquals(java.util.List.of("period"), action.pathParams());
    }

    @Test
    void unknownNotificationActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("notification.nonexistent"));
    }

    @Test
    void allNotificationOperationsRegistered() {
        assertTrue(actions.contains("notification.list"));
        assertTrue(actions.contains("notification.mark-as-read"));
    }

    @Test
    void allSubscriptionOperationsRegistered() {
        assertTrue(actions.contains("subscription.create"));
        assertTrue(actions.contains("subscription.get"));
        assertTrue(actions.contains("subscription.list"));
        assertTrue(actions.contains("subscription.update"));
        assertTrue(actions.contains("subscription.delete"));
        assertTrue(actions.contains("subscription.renew"));
    }

    @Test
    void allAuditReportOperationsRegistered() {
        assertTrue(actions.contains("auditreport.get-audit-log"));
        assertTrue(actions.contains("auditreport.get-sign-in-report"));
        assertTrue(actions.contains("auditreport.get-user-usage"));
        assertTrue(actions.contains("auditreport.get-mail-usage"));
        assertTrue(actions.contains("auditreport.get-sharepoint-usage"));
        assertTrue(actions.contains("auditreport.get-teams-usage"));
        assertTrue(actions.contains("auditreport.get-onedrive-usage"));
    }
}
