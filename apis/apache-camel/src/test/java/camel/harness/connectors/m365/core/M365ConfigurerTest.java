package camel.harness.connectors.m365.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for {@link M365Configurer} and the {@link M365Actions} registry:
 * dotted operation resolution, service/action fallback, unknown-operation
 * rejection, and descriptor route mapping.
 */
class M365ConfigurerTest extends M365ServiceTestSupport {

    @Test
    void connectorNameIsM365() {
        assertEquals("m365", configurer.connectorName());
    }

    @Test
    void userGetMapsToDirectRoute() {
        assertEquals("direct:m365.user.get", resolveRoute("user.get"));
        assertEquals("direct:m365.user.get", actions.require("user.get").route());
    }

    @Test
    void userListMapsToDirectRoute() {
        assertEquals("direct:m365.user.list", resolveRoute("user.list"));
    }

    @Test
    void mailSendMapsToDirectRoute() {
        assertEquals("direct:m365.mail.send", resolveRoute("mail.send"));
    }

    @Test
    void driveFileUploadMapsToDirectRoute() {
        assertEquals("direct:m365.drivefile.upload", resolveRoute("drivefile.upload"));
    }

    @Test
    void auditReportGetAuditLogMapsToDirectRoute() {
        assertEquals("direct:m365.auditreport.get-audit-log", resolveRoute("auditreport.get-audit-log"));
    }

    @Test
    void operationIsDottedServiceAction() {
        M365Action action = actions.require("group.list-members");
        assertEquals("group", action.service());
        assertEquals("list-members", action.action());
        assertEquals("group.list-members", action.operation());
    }

    @Test
    void userGetDeclaresPathParam() {
        M365Action action = actions.require("user.get");
        assertEquals(true, action.hasPathParams());
        assertEquals(java.util.List.of("userId"), action.pathParams());
        assertEquals("/users/{userId}", action.path());
    }

    @Test
    void userListIsPaginated() {
        M365Action action = actions.require("user.list");
        assertEquals(true, action.paginated());
        assertEquals("GET", action.method());
        assertEquals("/users", action.path());
    }

    @Test
    void unknownOperationRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("user.nonexistent"));
    }

    @Test
    void unknownOperationMessageListsCandidates() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> actions.require("does.not.exist"));
        assertTrue(ex.getMessage().contains("Unsupported M365 operation"));
        assertTrue(ex.getMessage().contains("user.get"));
    }

    @Test
    void registryContainsAllServiceFamilies() {
        assertTrue(actions.contains("user.get"));
        assertTrue(actions.contains("group.create"));
        assertTrue(actions.contains("mail.send"));
        assertTrue(actions.contains("drivefile.upload"));
        assertTrue(actions.contains("teams.clone"));
        assertTrue(actions.contains("planner.create-task"));
        assertTrue(actions.contains("subscription.renew"));
    }
}
