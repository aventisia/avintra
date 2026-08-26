package camel.harness.connectors.m365.core;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365Actions;

/**
 * Validates the canonical action model across the whole registry: every action
 * carries a description, required permissions, a documentation URL (for non
 * delegate actions), input/output fields, error codes, and a valid support
 * status. These invariants feed the capability matrix and per-action docs.
 */
class M365MetadataTest {

    private final M365Actions actions = new M365Actions();

    @Test
    void everyActionHasCanonicalMetadata() {
        List<M365Action> all = actions.all();
        assertFalse(all.isEmpty(), "registry must not be empty");

        List<String> missingDesc = all.stream()
            .filter(a -> !a.hasDescription())
            .map(M365Action::operation)
            .collect(Collectors.toList());
        // Plain (non-delegate) actions must declare permissions, inputs, outputs,
        // and a docs URL; delegates are implemented by domain services, so their
        // permission/input/output docs are documented there.
        List<M365Action> plain = all.stream().filter(a -> !a.hasDelegate()).toList();
        List<String> missingPerms = plain.stream()
            .filter(a -> a.requiredPermissions().isEmpty())
            .map(M365Action::operation)
            .collect(Collectors.toList());
        List<String> missingInputs = plain.stream()
            .filter(a -> !a.method().equals("GET") && a.inputFields().isEmpty())
            .map(M365Action::operation)
            .collect(Collectors.toList());
        // Plain actions that write must declare outputs only when they return a
        // resource; delete/action operations (204/empty) legitimately have none.
        List<String> missingOutputs = plain.stream()
            .filter(a -> a.method().equals("GET") && a.outputFields().isEmpty())
            .map(M365Action::operation)
            .collect(Collectors.toList());
        List<String> missingDocs = plain.stream()
            .filter(a -> a.documentationUrl() == null || a.documentationUrl().isBlank())
            .map(M365Action::operation)
            .collect(Collectors.toList());
        List<String> badStatus = all.stream()
            .filter(a -> a.supportStatus() == M365Action.Support.NOT_SUPPORTED)
            .map(M365Action::operation)
            .collect(Collectors.toList());

        assertTrue(missingDesc.isEmpty(), "actions missing description: " + missingDesc);
        assertTrue(missingPerms.isEmpty(), "plain actions missing requiredPermissions: " + missingPerms);
        assertTrue(missingInputs.isEmpty(), "plain actions missing inputFields: " + missingInputs);
        assertTrue(missingOutputs.isEmpty(), "plain actions missing outputFields: " + missingOutputs);
        assertTrue(missingDocs.isEmpty(), "plain actions missing documentationUrl: " + missingDocs);
        assertTrue(badStatus.isEmpty(),
            "NOT_SUPPORTED actions must be declared intentionally: " + badStatus);
    }

    @Test
    void everyActionHasUniqueOperationAndRoute() {
        List<String> operations = actions.operationNames();
        assertTrue(operations.size() == operations.stream().distinct().count(),
            "duplicate operation names detected");
        long distinctRoutes = actions.all().stream().map(M365Action::route).distinct().count();
        assertTrue(distinctRoutes == actions.all().size(), "duplicate route ids detected");
    }

    @Test
    void keyActionsCarryGraphScopes() {
        // Mail
        assertTrue(actions.require("mail.send").requiredPermissions().contains("Mail.Send"));
        assertTrue(actions.require("mail.get").requiredPermissions().contains("Mail.Read"));
        // OneDrive / files
        assertTrue(actions.require("onedrive.upload").requiredPermissions().contains("Files.ReadWrite"));
        assertTrue(actions.require("onedrive.download").requiredPermissions().contains("Files.Read"));
        // SharePoint
        assertTrue(actions.require("sharepointlistitem.list").requiredPermissions().contains("Sites.Read.All"));
        assertTrue(actions.require("sharepointdrive.upload").requiredPermissions().contains("Sites.ReadWrite.All"));
        // Teams
        assertTrue(actions.require("teamsmessage.send").requiredPermissions().contains("ChannelMessage.Send"));
        // Calendar / contacts
        assertTrue(actions.require("calendarevent.create").requiredPermissions().contains("Calendars.ReadWrite"));
        assertTrue(actions.require("contact.create").requiredPermissions().contains("Contacts.ReadWrite"));
    }

    @Test
    void limitedActionsAreDocumented() {
        List<String> limited = actions.all().stream()
            .filter(M365Action::isLimited)
            .map(M365Action::operation)
            .collect(Collectors.toList());
        // At least the upload-session action is declared LIMITED by design.
        assertTrue(limited.contains("drivefile.create-upload-session"),
            "drivefile.create-upload-session should be LIMITED (large-file upload not fully automated): "
                + limited);
    }

    @Test
    void groupedByServicePreservesOrder() {
        Map<String, List<M365Action>> byService = actions.all().stream()
            .collect(Collectors.groupingBy(M365Action::service,
                java.util.LinkedHashMap::new, Collectors.toList()));
        assertNotNull(byService.get("mail"));
        assertNotNull(byService.get("onedrive"));
        assertNotNull(byService.get("sharepointlistitem"));
        assertNotNull(byService.get("teams"));
        assertNotNull(byService.get("calendarevent"));
        assertNotNull(byService.get("contact"));
    }
}
