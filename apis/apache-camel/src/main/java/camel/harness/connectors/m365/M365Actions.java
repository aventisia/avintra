package camel.harness.connectors.m365;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Central registry of every Microsoft Graph action exposed by the harness. Each
 * entry declares the service family, action name, HTTP method, Graph path
 * template, required path parameters, accepted query parameters (including OData
 * system query options), pagination and auth requirements. Routes, dispatch,
 * validation, schema, and tests are all derived from this single source of
 * truth. Complex multi-step operations declare a {@code delegate} to a domain
 * service.
 */
@Component
public class M365Actions {

    private static final List<String> OData = List.of("$filter", "$select", "$expand", "$orderby",
            "$top", "$skiptoken", "$search");
    private static final List<String> ODataGet = List.of("$select", "$expand");

    /** Base URL for Microsoft Graph v1.0 REST reference documentation. */
    private static final String DOC = "https://learn.microsoft.com/graph/api/";

    // Common Microsoft Graph permission scopes used by this connector.
    private static final String SCOPE_MAIL_READ = "Mail.Read";
    private static final String SCOPE_MAIL_SEND = "Mail.Send";
    private static final String SCOPE_MAIL_READWRITE = "Mail.ReadWrite";
    private static final String SCOPE_FILES_READ = "Files.Read";
    private static final String SCOPE_FILES_READWRITE = "Files.ReadWrite";
    private static final String SCOPE_SITES_READ = "Sites.Read.All";
    private static final String SCOPE_SITES_READWRITE = "Sites.ReadWrite.All";
    private static final String SCOPE_USER_READ = "User.Read";
    private static final String SCOPE_USER_READ_ALL = "User.Read.All";
    private static final String SCOPE_USER_READWRITE_ALL = "User.ReadWrite.All";
    private static final String SCOPE_GROUP_READ_ALL = "Group.Read.All";
    private static final String SCOPE_GROUP_READWRITE_ALL = "Group.ReadWrite.All";
    private static final String SCOPE_CALENDAR_READ = "Calendars.Read";
    private static final String SCOPE_CALENDAR_READWRITE = "Calendars.ReadWrite";
    private static final String SCOPE_CONTACTS_READ = "Contacts.Read";
    private static final String SCOPE_CONTACTS_READWRITE = "Contacts.ReadWrite";
    private static final String SCOPE_CHANNEL_READ_ALL = "Channel.ReadBasic.All";
    private static final String SCOPE_CHANNEL_MESSAGE = "ChannelMessage.Send";
    private static final String SCOPE_TEAM_READ = "Team.ReadBasic.All";
    private static final String SCOPE_TEAM_READWRITE = "Team.ReadWrite.All";
    private static final String SCOPE_CHAT_READ = "Chat.ReadBasic.All";
    private static final String SCOPE_CHAT_READWRITE = "Chat.ReadWrite";
    private static final String SCOPE_DIRECTORY_READ_ALL = "Directory.Read.All";
    private static final String SCOPE_DIRECTORY_READWRITE_ALL = "Directory.ReadWrite.All";
    private static final String SCOPE_ORG_READ = "Organization.Read.All";
    private static final String SCOPE_PRESENCE_READ = "Presence.Read.All";
    private static final String SCOPE_PRESENCE_READWRITE = "Presence.ReadWrite.All";
    private static final String SCOPE_PLANNER_READ = "Group.Read.All";
    private static final String SCOPE_PLANNER_READWRITE = "Group.ReadWrite.All";
    private static final String SCOPE_TASKS_READ = "Tasks.Read";
    private static final String SCOPE_TASKS_READWRITE = "Tasks.ReadWrite";
    private static final String SCOPE_APPLICATION_READWRITE = "Application.ReadWrite.All";
    private static final String SCOPE_DEVICE_READ = "Device.Read.All";
    private static final String SCOPE_DEVICE_READWRITE = "Device.ReadWrite.All";
    private static final String SCOPE_REPORTS_READ = "Reports.Read.All";
    private static final String SCOPE_AUDIT_LOG_READ = "AuditLog.Read.All";
    private static final String SCOPE_SUBSCRIPTION_READWRITE = "Subscription.ReadWrite.All";
    private static final String SCOPE_ONLINE_MEETINGS_READ = "OnlineMeetings.Read.All";
    private static final String SCOPE_ONLINE_MEETINGS_READWRITE = "OnlineMeetings.ReadWrite.All";

    private final Map<String, M365Action> byOperation = new LinkedHashMap<>();

    public M365Actions() {
        registerAll();
    }

    private void register(M365Action action) {
        byOperation.put(action.operation(), action);
    }

    private void registerAll() {
        registerUser();
        registerGroup();
        registerMail();
        registerMailFolder();
        registerMailAttachment();
        registerCalendar();
        registerCalendarEvent();
        registerCalendarAttendee();
        registerContact();
        registerDrive();
        registerDriveFile();
        registerDrivePermission();
        registerSharePointSite();
        registerSharePointList();
        registerSharePointListItem();
        registerSharePointDrive();
        registerTeams();
        registerTeamsChannel();
        registerTeamsMember();
        registerTeamsMessage();
        registerTeamsChat();
        registerTeamsChatMember();
        registerTeamsMeeting();
        registerTeamsCall();
        registerOneDrive();
        registerDirectory();
        registerOrganization();
        registerDevice();
        registerApplication();
        registerServicePrincipal();
        registerPresence();
        registerPlanner();
        registerToDo();
        registerSearch();
        registerNotification();
        registerSubscription();
        registerAudit();
        registerAuth();
    }

    // ------------------------------------------------------------------
    // User
    // ------------------------------------------------------------------
    private void registerUser() {
        register(M365Action.rich("user", "get", "GET", "/users/{userId}", List.of("userId"),
            ODataGet, true, false, List.of("Get a user. userId may be an id or userPrincipalName."),
            "Get the properties of a Microsoft Entra ID user.",
            List.of(SCOPE_USER_READ, SCOPE_USER_READ_ALL), DOC + "user-get", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("id", "displayName", "userPrincipalName", "mail"),
            List.of("Request_ResourceNotFound", "InvalidAuthenticationToken")));
        register(M365Action.rich("user", "list", "GET", "/users", List.of(),
            OData, true, true, List.of("Lists users. Supports $filter, $select, $top, $skiptoken."),
            "List all users in the tenant, with OData filtering and paging.",
            List.of(SCOPE_USER_READ_ALL, SCOPE_DIRECTORY_READ_ALL), "user-list", M365Action.Support.SUPPORTED,
            List.of("$filter", "$select", "$top"), List.of("value[]"), List.of("AuthorizationRequestDenied")));
        register(M365Action.rich("user", "create", "POST", "/users", List.of(),
            List.of(), true, false, List.of("Payload: {accountEnabled, displayName, mailNickname, userPrincipalName, passwordProfile, ...}."),
            "Create a new Microsoft Entra ID user.",
            List.of(SCOPE_USER_READWRITE_ALL, SCOPE_DIRECTORY_READWRITE_ALL), "user-post-users", M365Action.Support.SUPPORTED,
            List.of("accountEnabled", "displayName", "mailNickname", "userPrincipalName", "passwordProfile"),
            List.of("id", "userPrincipalName"), List.of("Request_BadRequest")));
        register(M365Action.rich("user", "update", "PATCH", "/users/{userId}", List.of("userId"),
            List.of(), true, false, List.of("Payload: partial user properties to update."),
            "Update properties of a specific user.",
            List.of(SCOPE_USER_READWRITE_ALL, SCOPE_DIRECTORY_READWRITE_ALL), "user-update", M365Action.Support.SUPPORTED,
            List.of("displayName", "jobTitle", "mobilePhone"), List.of("id"), List.of("Request_UnsupportedQuery")));
        register(M365Action.rich("user", "delete", "DELETE", "/users/{userId}", List.of("userId"),
            List.of(), true, false, List.of("Deletes (soft-deletes) the user."),
            "Delete a specific user (soft delete).",
            List.of(SCOPE_USER_READWRITE_ALL, SCOPE_DIRECTORY_READWRITE_ALL), "user-delete", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of(), List.of("Request_ResourceNotFound")));
        register(M365Action.rich("user", "restore", "POST", "/directory/deletedItems/{userId}/restore", List.of("userId"),
            List.of(), true, false, List.of("Restores a soft-deleted user."),
            "Restore a soft-deleted user from the recycle bin.",
            List.of(SCOPE_DIRECTORY_READWRITE_ALL), "directory-deleteditems-user-restore", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("id", "userPrincipalName"), List.of()));
        register(M365Action.delegate("user", "assign-license", "user",
            "Assign a Microsoft license (SKU) to a user.", List.of("Directory.ReadWrite.All", "User.ReadWrite.All")));
        register(M365Action.delegate("user", "remove-license", "user",
            "Remove a Microsoft license (SKU) from a user.", List.of("Directory.ReadWrite.All", "User.ReadWrite.All")));
        register(M365Action.rich("user", "get-manager", "GET", "/users/{userId}/manager", List.of("userId"),
            ODataGet, true, false, List.of("Returns the user's manager."),
            "Get the manager (direct supervisor) of a user.",
            List.of(SCOPE_USER_READ, SCOPE_USER_READ_ALL), "user-list-manager", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("id", "displayName"), List.of()));
        register(M365Action.rich("user", "get-direct-reports", "GET", "/users/{userId}/directReports", List.of("userId"),
            OData, true, true, List.of("Lists the user's direct reports."),
            "List users who report to a specific user.",
            List.of(SCOPE_USER_READ, SCOPE_USER_READ_ALL), "user-list-directreports", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("user", "get-memberships", "GET", "/users/{userId}/memberOf", List.of("userId"),
            OData, true, true, List.of("Lists directory roles and groups the user is a member of."),
            "List groups and directory roles a user belongs to.",
            List.of(SCOPE_USER_READ, SCOPE_DIRECTORY_READ_ALL), "user-list-memberof", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("user", "get-owned-objects", "GET", "/users/{userId}/ownedObjects", List.of("userId"),
            OData, true, true, List.of("Lists directory objects owned by the user."),
            "List directory objects owned by a user.",
            List.of(SCOPE_USER_READ, SCOPE_DIRECTORY_READ_ALL), "user-list-ownedobjects", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        // ------------------------------------------------------------------
        // User profile & profile-management APIs
        // ------------------------------------------------------------------
        register(M365Action.rich("user", "get-profile", "GET", "/users/{userId}/profile", List.of("userId"),
            ODataGet, true, false, List.of("Get the profile of a user (name, emails, phones, addresses, ...)."),
            "Get a user's profile (Microsoft Graph profile API).",
            List.of(SCOPE_USER_READ, SCOPE_USER_READ_ALL), "userprofile-get", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("id", "displayName", "emails", "phones", "websites"),
            List.of("Request_ResourceNotFound")));
        register(M365Action.rich("user", "update-profile", "PATCH", "/users/{userId}/profile", List.of("userId"),
            List.of(), true, false, List.of("Payload: partial profile properties to update."),
            "Update a user's profile (Microsoft Graph profile API).",
            List.of(SCOPE_USER_READWRITE_ALL, SCOPE_DIRECTORY_READWRITE_ALL), "userprofile-update", M365Action.Support.SUPPORTED,
            List.of("displayName", "emails", "phones", "websites"), List.of("id"), List.of("Request_BadRequest")));
        register(M365Action.rich("user", "get-settings", "GET", "/users/{userId}/settings", List.of("userId"),
            ODataGet, true, false, List.of("Get the user's settings (regionalAndLanguageSettings, itemInsights, ...)."),
            "Get a user's settings.",
            List.of(SCOPE_USER_READ, SCOPE_USER_READ_ALL), "usersettings-get", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("id", "contributionToContentDiscoveryAsOrganizationDisabled",
                "contributionToContentDiscoveryDisabled"), List.of("Request_ResourceNotFound")));
        register(M365Action.rich("user", "update-settings", "PATCH", "/users/{userId}/settings", List.of("userId"),
            List.of(), true, false, List.of("Payload: partial settings to update."),
            "Update a user's settings.",
            List.of(SCOPE_USER_READWRITE_ALL, SCOPE_DIRECTORY_READWRITE_ALL), "usersettings-update", M365Action.Support.SUPPORTED,
            List.of("contributionToContentDiscoveryAsOrganizationDisabled",
                "contributionToContentDiscoveryDisabled"), List.of("id"), List.of("Request_BadRequest")));
        register(M365Action.rich("user", "get-photo", "GET", "/users/{userId}/photo/$value", List.of("userId"),
            List.of(), true, false, List.of("Returns the user's profile photo bytes (base64 in the envelope)."),
            "Get a user's profile photo.",
            List.of(SCOPE_USER_READ, SCOPE_USER_READ_ALL), "profilephoto-get", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("photo (base64)"), List.of("ErrorItemNotFound")));
        register(M365Action.rich("user", "update-photo", "PUT", "/users/{userId}/photo/$value", List.of("userId"),
            List.of(), true, false, List.of("Payload: base64-encoded photo bytes."),
            "Update a user's profile photo.",
            List.of(SCOPE_USER_READWRITE_ALL, SCOPE_DIRECTORY_READWRITE_ALL), "profilephoto-update", M365Action.Support.SUPPORTED,
            List.of("photo (base64)"), List.of(), List.of("Request_BadRequest")));
        register(M365Action.rich("user", "get-license-details", "GET", "/users/{userId}/licenseDetails", List.of("userId"),
            OData, true, true, List.of("Lists the licenses assigned to a user."),
            "List the Microsoft 365 licenses assigned to a user.",
            List.of(SCOPE_USER_READ, SCOPE_USER_READ_ALL, SCOPE_DIRECTORY_READ_ALL), "user-list-licensedetails", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of("Request_ResourceNotFound")));
        register(M365Action.rich("user", "get-transitive-memberships", "GET", "/users/{userId}/transitiveMemberOf", List.of("userId"),
            OData, true, true, List.of("Lists groups and roles the user is a member of, including transitive."),
            "List a user's transitive group/role memberships.",
            List.of(SCOPE_USER_READ, SCOPE_DIRECTORY_READ_ALL), "user-list-transitivememberof", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("user", "get-created-objects", "GET", "/users/{userId}/createdObjects", List.of("userId"),
            OData, true, true, List.of("Lists directory objects created by the user."),
            "List directory objects created by a user.",
            List.of(SCOPE_USER_READ, SCOPE_DIRECTORY_READ_ALL), "user-list-createdobjects", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("user", "get-oauth2-permission-grants", "GET", "/users/{userId}/oauth2PermissionGrants", List.of("userId"),
            OData, true, true, List.of("Lists OAuth2 permission grants for the user."),
            "List OAuth2 permission grants delegated to a user.",
            List.of(SCOPE_DIRECTORY_READ_ALL), "user-list-oauth2permissiongrants", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("user", "get-app-role-assignments", "GET", "/users/{userId}/appRoleAssignments", List.of("userId"),
            OData, true, true, List.of("Lists app role assignments for the user."),
            "List app role assignments granted to a user.",
            List.of(SCOPE_DIRECTORY_READ_ALL), "user-list-approleassignments", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("user", "get-scoped-role-memberships", "GET", "/users/{userId}/scopedRoleMemberOf", List.of("userId"),
            OData, true, true, List.of("Lists scoped role memberships for the user."),
            "List scoped role memberships of a user.",
            List.of(SCOPE_DIRECTORY_READ_ALL), "user-list-scopedrolememberof", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("user", "get-extension-properties", "GET", "/users/{userId}/extensions", List.of("userId"),
            OData, true, true, List.of("Lists open extensions on the user."),
            "List open extensions (custom properties) on a user.",
            List.of(SCOPE_USER_READ, SCOPE_USER_READ_ALL), "user-list-extensions", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("user", "add-extension-property", "POST", "/users/{userId}/extensions", List.of("userId"),
            List.of(), true, false, List.of("Payload: {extensionName, <custom properties>}."),
            "Add an open extension (custom property) to a user.",
            List.of(SCOPE_USER_READWRITE_ALL, SCOPE_DIRECTORY_READWRITE_ALL), "user-post-extensions", M365Action.Support.SUPPORTED,
            List.of("extensionName"), List.of("id"), List.of("Request_BadRequest")));
        register(M365Action.rich("user", "get-outlook-settings", "GET", "/users/{userId}/mailboxSettings", List.of("userId"),
            ODataGet, true, false, List.of("Get the user's mailbox settings (automatic replies, time zone, ...)."),
            "Get a user's mailbox settings.",
            List.of(SCOPE_MAIL_READ, SCOPE_MAIL_READWRITE), "user-get-mailboxsettings", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("automaticRepliesSetting", "timeZone", "language"), List.of("Request_ResourceNotFound")));
        register(M365Action.rich("user", "update-outlook-settings", "PATCH", "/users/{userId}/mailboxSettings", List.of("userId"),
            List.of(), true, false, List.of("Payload: partial mailbox settings to update."),
            "Update a user's mailbox settings.",
            List.of(SCOPE_MAIL_READWRITE), "user-update-mailboxsettings", M365Action.Support.SUPPORTED,
            List.of("automaticRepliesSetting", "timeZone", "language"), List.of(), List.of("Request_BadRequest")));
    }

    // ------------------------------------------------------------------
    // Group
    // ------------------------------------------------------------------
    private void registerGroup() {
        register(M365Action.rich("group", "get", "GET", "/groups/{groupId}", List.of("groupId"),
            ODataGet, true, false, List.of(),
            "Get the properties of a Microsoft 365 or security group.",
            List.of(SCOPE_GROUP_READ_ALL), "group-get", M365Action.Support.SUPPORTED,
            List.of("groupId"), List.of("id", "displayName", "mailEnabled", "securityEnabled"), List.of()));
        register(M365Action.rich("group", "list", "GET", "/groups", List.of(),
            OData, true, true, List.of(),
            "List all groups in the tenant, with OData filtering and paging.",
            List.of(SCOPE_GROUP_READ_ALL), "group-list", M365Action.Support.SUPPORTED,
            List.of("$filter", "$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("group", "create", "POST", "/groups", List.of(),
            List.of(), true, false, List.of("Payload: {displayName, mailEnabled, mailNickname, securityEnabled, ...}."),
            "Create a new Microsoft 365 or security group.",
            List.of(SCOPE_GROUP_READWRITE_ALL), "group-post-groups", M365Action.Support.SUPPORTED,
            List.of("displayName", "mailEnabled", "mailNickname", "securityEnabled"),
            List.of("id", "displayName"), List.of("Request_BadRequest")));
        register(M365Action.rich("group", "update", "PATCH", "/groups/{groupId}", List.of("groupId"),
            List.of(), true, false, List.of(),
            "Update properties of a group.",
            List.of(SCOPE_GROUP_READWRITE_ALL), "group-update", M365Action.Support.SUPPORTED,
            List.of("displayName", "description"), List.of("id"), List.of()));
        register(M365Action.rich("group", "delete", "DELETE", "/groups/{groupId}", List.of("groupId"),
            List.of(), true, false, List.of(),
            "Delete a group (and its underlying Microsoft 365 resources where applicable).",
            List.of(SCOPE_GROUP_READWRITE_ALL), "group-delete", M365Action.Support.SUPPORTED,
            List.of("groupId"), List.of(), List.of("Request_ResourceNotFound")));
        register(M365Action.rich("group", "add-member", "POST", "/groups/{groupId}/members/$ref", List.of("groupId"),
            List.of(), true, false, List.of("Payload: {\"@odata.id\": \"https://graph.microsoft.com/v1.0/directoryObjects/{userId}\"}."),
            "Add a member (user) to a group.",
            List.of(SCOPE_GROUP_READWRITE_ALL), "group-post-members", M365Action.Support.SUPPORTED,
            List.of("groupId", "@odata.id"), List.of(), List.of("Request_BadRequest")));
        register(M365Action.rich("group", "remove-member", "DELETE",
            "/groups/{groupId}/members/{userId}/$ref", List.of("groupId", "userId"),
            List.of(), true, false, List.of(),
            "Remove a member from a group.",
            List.of(SCOPE_GROUP_READWRITE_ALL), "group-delete-members", M365Action.Support.SUPPORTED,
            List.of("groupId", "userId"), List.of(), List.of()));
        register(M365Action.rich("group", "list-members", "GET", "/groups/{groupId}/members", List.of("groupId"),
            OData, true, true, List.of(),
            "List members of a group.",
            List.of(SCOPE_GROUP_READ_ALL), "group-list-members", M365Action.Support.SUPPORTED,
            List.of("groupId"), List.of("value[]"), List.of()));
        register(M365Action.rich("group", "add-owner", "POST", "/groups/{groupId}/owners/$ref", List.of("groupId"),
            List.of(), true, false, List.of("Payload: {\"@odata.id\": \"https://graph.microsoft.com/v1.0/users/{userId}\"}."),
            "Add an owner to a group.",
            List.of(SCOPE_GROUP_READWRITE_ALL), "group-post-owners", M365Action.Support.SUPPORTED,
            List.of("groupId", "@odata.id"), List.of(), List.of("Request_MultipleObjectsWithSameKeyValue")));
        register(M365Action.rich("group", "remove-owner", "DELETE",
            "/groups/{groupId}/owners/{userId}/$ref", List.of("groupId", "userId"),
            List.of(), true, false, List.of(),
            "Remove an owner from a group.",
            List.of(SCOPE_GROUP_READWRITE_ALL), "group-delete-owners", M365Action.Support.SUPPORTED,
            List.of("groupId", "userId"), List.of(), List.of()));
        register(M365Action.rich("group", "list-owners", "GET", "/groups/{groupId}/owners", List.of("groupId"),
            OData, true, false, List.of(),
            "List owners of a group.",
            List.of(SCOPE_GROUP_READ_ALL, SCOPE_DIRECTORY_READ_ALL), "group-list-owners", M365Action.Support.SUPPORTED,
            List.of("groupId"), List.of("value[]"), List.of()));
        register(M365Action.rich("group", "add-app-role-assignment", "POST",
            "/groups/{groupId}/appRoleAssignments", List.of("groupId"),
            List.of(), true, false, List.of("Payload: {principalId, resourceId, appRoleId}."),
            "Assign an application role to a group.",
            List.of(SCOPE_DIRECTORY_READWRITE_ALL), "group-post-approleassignments", M365Action.Support.SUPPORTED,
            List.of("principalId", "resourceId", "appRoleId"), List.of("id"), List.of()));
        register(M365Action.rich("group", "remove-app-role-assignment", "DELETE",
            "/groups/{groupId}/appRoleAssignments/{appRoleAssignmentId}", List.of("groupId", "appRoleAssignmentId"),
            List.of(), true, false, List.of(),
            "Remove an application role assignment from a group.",
            List.of(SCOPE_DIRECTORY_READWRITE_ALL), "group-delete-approleassignments", M365Action.Support.SUPPORTED,
            List.of("groupId", "appRoleAssignmentId"), List.of(), List.of()));
    }

    // ------------------------------------------------------------------
    // Mail
    // ------------------------------------------------------------------
    private void registerMail() {
        register(M365Action.delegate("mail", "send", "mail",
            "Send a mail message (creates and sends via the sendMail action).",
            List.of(SCOPE_MAIL_SEND)));
        register(M365Action.rich("mail", "get", "GET", "/users/{userId}/messages/{messageId}",
            List.of("userId", "messageId"), ODataGet, true, false, List.of(),
            "Get a single mail message, with optional $select/$expand.",
            List.of(SCOPE_MAIL_READ), "message-get", M365Action.Support.SUPPORTED,
            List.of("userId", "messageId"), List.of("id", "subject", "from", "body"), List.of("ErrorItemNotFound")));
        register(M365Action.rich("mail", "list", "GET", "/users/{userId}/messages", List.of("userId"),
            OData, true, true, List.of(),
            "List messages in a user's mailbox, with OData filtering and paging.",
            List.of(SCOPE_MAIL_READ), "user-list-messages", M365Action.Support.SUPPORTED,
            List.of("userId", "$filter", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("mail", "create", "POST", "/users/{userId}/messages", List.of("userId"),
            List.of(), true, false, List.of("Creates a draft message (does not send). Payload: {subject, body, toRecipients, ...}."),
            "Create a draft message (does not send it).",
            List.of(SCOPE_MAIL_READWRITE), "user-post-messages", M365Action.Support.SUPPORTED,
            List.of("subject", "body", "toRecipients"), List.of("id", "subject"), List.of()));
        register(M365Action.rich("mail", "update", "PATCH", "/users/{userId}/messages/{messageId}",
            List.of("userId", "messageId"), List.of(), true, false, List.of(),
            "Update properties of a message (e.g. subject, body).",
            List.of(SCOPE_MAIL_READWRITE), "message-update", M365Action.Support.SUPPORTED,
            List.of("subject", "body", "isRead"), List.of("id"), List.of()));
        register(M365Action.rich("mail", "delete", "DELETE", "/users/{userId}/messages/{messageId}",
            List.of("userId", "messageId"), List.of(), true, false, List.of(),
            "Delete a message.",
            List.of(SCOPE_MAIL_READWRITE), "message-delete", M365Action.Support.SUPPORTED,
            List.of("userId", "messageId"), List.of(), List.of("ErrorItemNotFound")));
        register(M365Action.rich("mail", "move", "POST", "/users/{userId}/messages/{messageId}/move",
            List.of("userId", "messageId"), List.of(), true, false, List.of("Payload: {destinationId: folderId}."),
            "Move a message to another folder.",
            List.of(SCOPE_MAIL_READWRITE), "message-move", M365Action.Support.SUPPORTED,
            List.of("destinationId"), List.of("id", "parentFolderId"), List.of("ErrorFolderNotFound")));
        register(M365Action.rich("mail", "copy", "POST", "/users/{userId}/messages/{messageId}/copy",
            List.of("userId", "messageId"), List.of(), true, false, List.of("Payload: {destinationId: folderId}."),
            "Copy a message to another folder.",
            List.of(SCOPE_MAIL_READWRITE), "message-copy", M365Action.Support.SUPPORTED,
            List.of("destinationId"), List.of("id", "parentFolderId"), List.of("ErrorFolderNotFound")));
        register(M365Action.rich("mail", "forward", "POST", "/users/{userId}/messages/{messageId}/forward",
            List.of("userId", "messageId"), List.of(), true, false, List.of("Payload: {toRecipients, comment}."),
            "Forward a message to recipients.",
            List.of(SCOPE_MAIL_SEND), "message-forward", M365Action.Support.SUPPORTED,
            List.of("toRecipients", "comment"), List.of(), List.of("ErrorInvalidRecipients")));
        register(M365Action.rich("mail", "reply", "POST", "/users/{userId}/messages/{messageId}/reply",
            List.of("userId", "messageId"), List.of(), true, false, List.of("Payload: {comment}."),
            "Reply to the sender of a message.",
            List.of(SCOPE_MAIL_SEND), "message-reply", M365Action.Support.SUPPORTED,
            List.of("comment"), List.of(), List.of()));
        register(M365Action.rich("mail", "reply-all", "POST", "/users/{userId}/messages/{messageId}/replyAll",
            List.of("userId", "messageId"), List.of(), true, false, List.of("Payload: {comment}."),
            "Reply to all recipients of a message.",
            List.of(SCOPE_MAIL_SEND), "message-replyall", M365Action.Support.SUPPORTED,
            List.of("comment"), List.of(), List.of()));
        register(M365Action.rich("mail", "create-draft", "POST", "/users/{userId}/messages", List.of("userId"),
            List.of(), true, false, List.of("Creates a draft message. Payload: {subject, toRecipients, ...}."),
            "Create a draft message in the Drafts folder.",
            List.of(SCOPE_MAIL_READWRITE), "user-post-messages", M365Action.Support.SUPPORTED,
            List.of("subject", "toRecipients"), List.of("id", "isDraft"), List.of()));
        register(M365Action.rich("mail", "send-draft", "POST", "/users/{userId}/messages/{messageId}/send",
            List.of("userId", "messageId"), List.of(), true, false, List.of(),
            "Send an existing draft message.",
            List.of(SCOPE_MAIL_SEND), "message-send", M365Action.Support.SUPPORTED,
            List.of("userId", "messageId"), List.of(), List.of("ErrorCannotDeleteIndelibly")));
    }

    // ------------------------------------------------------------------
    // Mail Folder
    // ------------------------------------------------------------------
    private void registerMailFolder() {
        register(M365Action.rich("mailfolder", "get", "GET", "/users/{userId}/mailFolders/{mailFolderId}",
            List.of("userId", "mailFolderId"), ODataGet, true, false, List.of(),
            "Get a single mail folder.",
            List.of(SCOPE_MAIL_READ), "mailfolder-get", M365Action.Support.SUPPORTED,
            List.of("userId", "mailFolderId"), List.of("id", "displayName", "childFolderCount"), List.of()));
        register(M365Action.rich("mailfolder", "list", "GET", "/users/{userId}/mailFolders", List.of("userId"),
            OData, true, true, List.of(),
            "List the mail folders of a user's mailbox.",
            List.of(SCOPE_MAIL_READ), "user-list-mailfolders", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("mailfolder", "create", "POST", "/users/{userId}/mailFolders", List.of("userId"),
            List.of(), true, false, List.of("Payload: {displayName}."),
            "Create a new mail folder.",
            List.of(SCOPE_MAIL_READWRITE), "user-post-mailfolders", M365Action.Support.SUPPORTED,
            List.of("displayName"), List.of("id", "displayName"), List.of()));
        register(M365Action.rich("mailfolder", "update", "PATCH", "/users/{userId}/mailFolders/{mailFolderId}",
            List.of("userId", "mailFolderId"), List.of(), true, false, List.of(),
            "Update a mail folder (e.g. rename).",
            List.of(SCOPE_MAIL_READWRITE), "mailfolder-update", M365Action.Support.SUPPORTED,
            List.of("displayName"), List.of("id"), List.of()));
        register(M365Action.rich("mailfolder", "delete", "DELETE", "/users/{userId}/mailFolders/{mailFolderId}",
            List.of("userId", "mailFolderId"), List.of(), true, false, List.of(),
            "Delete a mail folder.",
            List.of(SCOPE_MAIL_READWRITE), "mailfolder-delete", M365Action.Support.SUPPORTED,
            List.of("userId", "mailFolderId"), List.of(), List.of()));
    }

    // ------------------------------------------------------------------
    // Mail Attachment
    // ------------------------------------------------------------------
    private void registerMailAttachment() {
        register(M365Action.rich("mailattachment", "get", "GET",
            "/users/{userId}/messages/{messageId}/attachments/{attachmentId}",
            List.of("userId", "messageId", "attachmentId"), ODataGet, true, false, List.of(),
            "Get a single attachment on a message.",
            List.of(SCOPE_MAIL_READ), "attachment-get", M365Action.Support.SUPPORTED,
            List.of("userId", "messageId", "attachmentId"), List.of("id", "name", "contentType"), List.of()));
        register(M365Action.rich("mailattachment", "list", "GET",
            "/users/{userId}/messages/{messageId}/attachments",
            List.of("userId", "messageId"), OData, true, true, List.of(),
            "List attachments on a message.",
            List.of(SCOPE_MAIL_READ), "message-list-attachments", M365Action.Support.SUPPORTED,
            List.of("userId", "messageId"), List.of("value[]"), List.of()));
        register(M365Action.delegate("mailattachment", "add", "mailattachment",
            "Add a file attachment to a message (base64-encoded fileAttachment).",
            List.of(SCOPE_MAIL_READWRITE)));
        register(M365Action.rich("mailattachment", "update", "PATCH",
            "/users/{userId}/messages/{messageId}/attachments/{attachmentId}",
            List.of("userId", "messageId", "attachmentId"), List.of(), true, false, List.of(),
            "Update an attachment's metadata (name/contentType).",
            List.of(SCOPE_MAIL_READWRITE), "attachment-update", M365Action.Support.SUPPORTED,
            List.of("userId", "messageId", "attachmentId", "name"), List.of("id"), List.of()));
        register(M365Action.rich("mailattachment", "delete", "DELETE",
            "/users/{userId}/messages/{messageId}/attachments/{attachmentId}",
            List.of("userId", "messageId", "attachmentId"), List.of(), true, false, List.of(),
            "Delete an attachment from a message.",
            List.of(SCOPE_MAIL_READWRITE), "attachment-delete", M365Action.Support.SUPPORTED,
            List.of("userId", "messageId", "attachmentId"), List.of(), List.of()));
        register(M365Action.rich("mailattachment", "download", "GET",
            "/users/{userId}/messages/{messageId}/attachments/{attachmentId}/$value",
            List.of("userId", "messageId", "attachmentId"), List.of(), true, false, List.of(
                "Returns the raw attachment content; base64-encoded in the envelope."),
            "Download the raw content of a message attachment.",
            List.of(SCOPE_MAIL_READ), "attachment-get", M365Action.Support.SUPPORTED,
            List.of("userId", "messageId", "attachmentId"), List.of("content (base64)"), List.of()));
    }

    // ------------------------------------------------------------------
    // Calendar
    // ------------------------------------------------------------------
    private void registerCalendar() {
        register(M365Action.rich("calendar", "get", "GET", "/users/{userId}/calendar", List.of("userId"),
            ODataGet, true, false, List.of(),
            "Get the default calendar of a user.",
            List.of(SCOPE_CALENDAR_READ), "calendar-get", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("id", "name", "owner"), List.of()));
        register(M365Action.rich("calendar", "list", "GET", "/users/{userId}/calendars", List.of("userId"),
            OData, true, true, List.of(),
            "List all calendars of a user.",
            List.of(SCOPE_CALENDAR_READ), "user-list-calendars", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("calendar", "create", "POST", "/users/{userId}/calendars", List.of("userId"),
            List.of(), true, false, List.of("Payload: {name, color}."),
            "Create a new calendar for a user.",
            List.of(SCOPE_CALENDAR_READWRITE), "user-post-calendars", M365Action.Support.SUPPORTED,
            List.of("name", "color"), List.of("id", "name"), List.of()));
        register(M365Action.rich("calendar", "update", "PATCH", "/users/{userId}/calendars/{calendarId}",
            List.of("userId", "calendarId"), List.of(), true, false, List.of(),
            "Update a calendar (rename, recolor).",
            List.of(SCOPE_CALENDAR_READWRITE), "calendar-update", M365Action.Support.SUPPORTED,
            List.of("name", "color"), List.of("id"), List.of()));
        register(M365Action.rich("calendar", "delete", "DELETE", "/users/{userId}/calendars/{calendarId}",
            List.of("userId", "calendarId"), List.of(), true, false, List.of(),
            "Delete a calendar.",
            List.of(SCOPE_CALENDAR_READWRITE), "calendar-delete", M365Action.Support.SUPPORTED,
            List.of("userId", "calendarId"), List.of(), List.of()));
    }

    // ------------------------------------------------------------------
    // Calendar Event
    // ------------------------------------------------------------------
    private void registerCalendarEvent() {
        register(M365Action.rich("calendarevent", "get", "GET",
            "/users/{userId}/events/{eventId}", List.of("userId", "eventId"),
            ODataGet, true, false, List.of(),
            "Get a single calendar event.",
            List.of(SCOPE_CALENDAR_READ), "event-get", M365Action.Support.SUPPORTED,
            List.of("userId", "eventId"), List.of("id", "subject", "start", "end"), List.of("ErrorItemNotFound")));
        register(M365Action.rich("calendarevent", "list", "GET",
            "/users/{userId}/calendar/events", List.of("userId"),
            OData, true, true, List.of(),
            "List events in a user's calendar, with OData filtering and paging.",
            List.of(SCOPE_CALENDAR_READ), "user-list-events", M365Action.Support.SUPPORTED,
            List.of("userId", "$filter", "$startDateTime", "$endDateTime"), List.of("value[]"), List.of()));
        register(M365Action.rich("calendarevent", "create", "POST",
            "/users/{userId}/calendar/events", List.of("userId"),
            List.of(), true, false, List.of("Payload: {subject, start, end, attendees, ...}."),
            "Create a new calendar event.",
            List.of(SCOPE_CALENDAR_READWRITE), "user-post-events", M365Action.Support.SUPPORTED,
            List.of("subject", "start", "end", "attendees"), List.of("id", "subject"), List.of("ErrorInvalidTimeZone")));
        register(M365Action.rich("calendarevent", "update", "PATCH",
            "/users/{userId}/events/{eventId}", List.of("userId", "eventId"),
            List.of(), true, false, List.of(),
            "Update a calendar event.",
            List.of(SCOPE_CALENDAR_READWRITE), "event-update", M365Action.Support.SUPPORTED,
            List.of("subject", "start", "end", "location"), List.of("id"), List.of()));
        register(M365Action.rich("calendarevent", "delete", "DELETE",
            "/users/{userId}/events/{eventId}", List.of("userId", "eventId"),
            List.of(), true, false, List.of(),
            "Delete a calendar event.",
            List.of(SCOPE_CALENDAR_READWRITE), "event-delete", M365Action.Support.SUPPORTED,
            List.of("userId", "eventId"), List.of(), List.of("ErrorItemNotFound")));
        register(M365Action.rich("calendarevent", "cancel", "POST",
            "/users/{userId}/events/{eventId}/cancel", List.of("userId", "eventId"),
            List.of(), true, false, List.of("Payload: {comment}."),
            "Cancel an event and send cancellation notices.",
            List.of(SCOPE_CALENDAR_READWRITE), "event-cancel", M365Action.Support.SUPPORTED,
            List.of("comment"), List.of(), List.of()));
        register(M365Action.rich("calendarevent", "accept", "POST",
            "/users/{userId}/events/{eventId}/accept", List.of("userId", "eventId"),
            List.of(), true, false, List.of("Payload: {comment, sendResponse}."),
            "Accept an event invitation.",
            List.of(SCOPE_CALENDAR_READWRITE), "event-accept", M365Action.Support.SUPPORTED,
            List.of("comment", "sendResponse"), List.of(), List.of()));
        register(M365Action.rich("calendarevent", "decline", "POST",
            "/users/{userId}/events/{eventId}/decline", List.of("userId", "eventId"),
            List.of(), true, false, List.of("Payload: {comment, sendResponse}."),
            "Decline an event invitation.",
            List.of(SCOPE_CALENDAR_READWRITE), "event-decline", M365Action.Support.SUPPORTED,
            List.of("comment", "sendResponse"), List.of(), List.of()));
        register(M365Action.rich("calendarevent", "tentatively-accept", "POST",
            "/users/{userId}/events/{eventId}/tentativelyAccept", List.of("userId", "eventId"),
            List.of(), true, false, List.of("Payload: {comment, sendResponse}."),
            "Tentatively accept an event invitation.",
            List.of(SCOPE_CALENDAR_READWRITE), "event-tentativelyaccept", M365Action.Support.SUPPORTED,
            List.of("comment", "sendResponse"), List.of(), List.of()));
        register(M365Action.rich("calendarevent", "forward", "POST",
            "/users/{userId}/events/{eventId}/forward", List.of("userId", "eventId"),
            List.of(), true, false, List.of("Payload: {toRecipients, comment}."),
            "Forward an event to recipients.",
            List.of(SCOPE_CALENDAR_READWRITE), "event-forward", M365Action.Support.SUPPORTED,
            List.of("toRecipients", "comment"), List.of(), List.of()));
    }

    // ------------------------------------------------------------------
    // Calendar Attendee
    // ------------------------------------------------------------------
    private void registerCalendarAttendee() {
        register(M365Action.delegate("calendarattendee", "add", "calendarevent",
            "Add an attendee to a calendar event (read-modify-write).", List.of(SCOPE_CALENDAR_READWRITE)));
        register(M365Action.delegate("calendarattendee", "update", "calendarevent",
            "Update an attendee on a calendar event.", List.of(SCOPE_CALENDAR_READWRITE)));
        register(M365Action.delegate("calendarattendee", "remove", "calendarevent",
            "Remove an attendee from a calendar event.", List.of(SCOPE_CALENDAR_READWRITE)));
        register(M365Action.rich("calendarattendee", "list", "GET",
            "/users/{userId}/events/{eventId}/attendees", List.of("userId", "eventId"),
            OData, true, true, List.of(),
            "List attendees of a calendar event.",
            List.of(SCOPE_CALENDAR_READ), "event-list-attendees", M365Action.Support.SUPPORTED,
            List.of("userId", "eventId"), List.of("value[]"), List.of()));
    }

    // ------------------------------------------------------------------
    // Contact
    // ------------------------------------------------------------------
    private void registerContact() {
        register(M365Action.rich("contact", "get", "GET", "/users/{userId}/contacts/{contactId}",
            List.of("userId", "contactId"), ODataGet, true, false, List.of(),
            "Get a single contact.",
            List.of(SCOPE_CONTACTS_READ), "contact-get", M365Action.Support.SUPPORTED,
            List.of("userId", "contactId"), List.of("id", "displayName", "emailAddresses"), List.of("ErrorItemNotFound")));
        register(M365Action.rich("contact", "list", "GET", "/users/{userId}/contacts", List.of("userId"),
            OData, true, true, List.of(),
            "List a user's contacts, with OData filtering and paging.",
            List.of(SCOPE_CONTACTS_READ), "user-list-contacts", M365Action.Support.SUPPORTED,
            List.of("userId", "$filter", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("contact", "create", "POST", "/users/{userId}/contacts", List.of("userId"),
            List.of(), true, false, List.of("Payload: {givenName, surname, emailAddresses, ...}."),
            "Create a new contact.",
            List.of(SCOPE_CONTACTS_READWRITE), "user-post-contacts", M365Action.Support.SUPPORTED,
            List.of("givenName", "surname", "emailAddresses"), List.of("id", "displayName"), List.of()));
        register(M365Action.rich("contact", "update", "PATCH", "/users/{userId}/contacts/{contactId}",
            List.of("userId", "contactId"), List.of(), true, false, List.of(),
            "Update a contact.",
            List.of(SCOPE_CONTACTS_READWRITE), "contact-update", M365Action.Support.SUPPORTED,
            List.of("displayName", "emailAddresses", "mobilePhone"), List.of("id"), List.of()));
        register(M365Action.rich("contact", "delete", "DELETE", "/users/{userId}/contacts/{contactId}",
            List.of("userId", "contactId"), List.of(), true, false, List.of(),
            "Delete a contact.",
            List.of(SCOPE_CONTACTS_READWRITE), "contact-delete", M365Action.Support.SUPPORTED,
            List.of("userId", "contactId"), List.of(), List.of("ErrorItemNotFound")));
    }

    // ------------------------------------------------------------------
    // Drive
    // ------------------------------------------------------------------
    private void registerDrive() {
        register(M365Action.rich("drive", "get", "GET", "/drives/{driveId}", List.of("driveId"),
            ODataGet, true, false, List.of(),
            "Get metadata about a specific drive.",
            List.of(SCOPE_FILES_READ), "drive-get", M365Action.Support.SUPPORTED,
            List.of("driveId"), List.of("id", "driveType", "owner"), List.of()));
        register(M365Action.rich("drive", "list", "GET", "/drives", List.of(),
            OData, true, true, List.of(),
            "List all drives in the tenant.",
            List.of(SCOPE_FILES_READ, SCOPE_SITES_READ), "drive-list", M365Action.Support.SUPPORTED,
            List.of("$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("drive", "create-folder", "POST", "/drives/{driveId}/root/children",
            List.of("driveId"), List.of(), true, false, List.of("Payload: {name, folder:{}, @microsoft.graph.conflictBehavior}."),
            "Create a folder in the root of a drive.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-post-children", M365Action.Support.SUPPORTED,
            List.of("name", "folder", "@microsoft.graph.conflictBehavior"), List.of("id", "name"), List.of("nameAlreadyExists")));
        register(M365Action.rich("drive", "update", "PATCH", "/drives/{driveId}", List.of("driveId"),
            List.of(), true, false, List.of(),
            "Update drive metadata.",
            List.of(SCOPE_FILES_READWRITE), "drive-update", M365Action.Support.SUPPORTED,
            List.of("description"), List.of("id"), List.of()));
        register(M365Action.rich("drive", "delete", "DELETE", "/drives/{driveId}", List.of("driveId"),
            List.of(), true, false, List.of(),
            "Delete a drive.",
            List.of(SCOPE_FILES_READWRITE), "drive-delete", M365Action.Support.SUPPORTED,
            List.of("driveId"), List.of(), List.of("itemNotFound")));
        register(M365Action.rich("drive", "copy", "POST", "/drives/{driveId}/items/{itemId}/copy",
            List.of("driveId", "itemId"), List.of(), true, false, List.of("Payload: {parentReference, name}."),
            "Copy a drive item to another location.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-copy", M365Action.Support.SUPPORTED,
            List.of("parentReference", "name"), List.of(), List.of()));
        register(M365Action.rich("drive", "move", "PATCH", "/drives/{driveId}/items/{itemId}",
            List.of("driveId", "itemId"), List.of(), true, false, List.of("Payload: {parentReference, name}."),
            "Move a drive item to another location or rename it.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-update", M365Action.Support.SUPPORTED,
            List.of("parentReference", "name"), List.of("id", "name"), List.of("itemNotFound")));
        register(M365Action.rich("drive", "search", "GET", "/drives/{driveId}/root/search(q='{q}')",
            List.of("driveId", "q"), List.of("$top"), true, true, List.of(
                "Searches a drive. Provide q as a path parameter or configuration.q."),
            "Search for files/folders in a drive by keyword.",
            List.of(SCOPE_FILES_READ), "driveitem-search", M365Action.Support.SUPPORTED,
            List.of("q", "$top"), List.of("value[]"), List.of()));
    }

    // ------------------------------------------------------------------
    // Drive File
    // ------------------------------------------------------------------
    private void registerDriveFile() {
        register(M365Action.rich("drivefile", "get", "GET", "/drives/{driveId}/items/{itemId}",
            List.of("driveId", "itemId"), ODataGet, true, false, List.of(),
            "Get metadata of a specific drive item (file or folder).",
            List.of(SCOPE_FILES_READ), "driveitem-get", M365Action.Support.SUPPORTED,
            List.of("driveId", "itemId"), List.of("id", "name", "size", "parentReference"), List.of("itemNotFound")));
        register(M365Action.rich("drivefile", "list", "GET", "/drives/{driveId}/root/children",
            List.of("driveId"), OData, true, true, List.of(),
            "List the children (files and folders) in the root of a drive.",
            List.of(SCOPE_FILES_READ), "driveitem-list-children", M365Action.Support.SUPPORTED,
            List.of("driveId", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("drivefile", "upload", "PUT", "/drives/{driveId}/items/{parentId}:/{filename}:/content",
            List.of("driveId", "parentId", "filename"), List.of(), true, false, List.of(
                "Simple upload. Payload is the file content (raw or base64)."),
            "Upload (or replace) a file using the simple upload endpoint.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-put-content", M365Action.Support.SUPPORTED,
            List.of("filename", "content"), List.of("id", "name", "size"), List.of("itemNotFound", "malformed")));
        register(M365Action.rich("drivefile", "download", "GET", "/drives/{driveId}/items/{itemId}/content",
            List.of("driveId", "itemId"), List.of(), true, false, List.of(
                "Returns the file content; base64-encoded in the envelope."),
            "Download the raw content of a drive item.",
            List.of(SCOPE_FILES_READ), "driveitem-get-content", M365Action.Support.SUPPORTED,
            List.of("driveId", "itemId"), List.of("content (base64)"), List.of("itemNotFound")));
        register(M365Action.rich("drivefile", "update", "PATCH", "/drives/{driveId}/items/{itemId}",
            List.of("driveId", "itemId"), List.of(), true, false, List.of("Payload: {name} or metadata."),
            "Update drive item metadata (e.g. rename).",
            List.of(SCOPE_FILES_READWRITE), "driveitem-update", M365Action.Support.SUPPORTED,
            List.of("name"), List.of("id", "name"), List.of("itemNotFound")));
        register(M365Action.rich("drivefile", "delete", "DELETE", "/drives/{driveId}/items/{itemId}",
            List.of("driveId", "itemId"), List.of(), true, false, List.of(),
            "Delete a drive item.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-delete", M365Action.Support.SUPPORTED,
            List.of("driveId", "itemId"), List.of(), List.of("itemNotFound")));
        register(M365Action.rich("drivefile", "copy", "POST", "/drives/{driveId}/items/{itemId}/copy",
            List.of("driveId", "itemId"), List.of(), true, false, List.of("Payload: {parentReference, name}."),
            "Copy a drive item to another location.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-copy", M365Action.Support.SUPPORTED,
            List.of("parentReference", "name"), List.of(), List.of()));
        register(M365Action.rich("drivefile", "move", "PATCH", "/drives/{driveId}/items/{itemId}",
            List.of("driveId", "itemId"), List.of(), true, false, List.of("Payload: {parentReference, name}."),
            "Move a drive item to another location or rename it.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-update", M365Action.Support.SUPPORTED,
            List.of("parentReference", "name"), List.of("id", "name"), List.of("itemNotFound")));
        register(M365Action.rich("drivefile", "create-upload-session", "POST",
            "/drives/{driveId}/items/{parentId}:/{filename}:/createUploadSession",
            List.of("driveId", "parentId", "filename"), List.of(), true, false, List.of(
                "Creates an upload session. Payload: {item: {name, ...}}."),
            "Create a resumable upload session for large files.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-createuploadsession", M365Action.Support.LIMITED,
            List.of("item", "filename"), List.of("uploadUrl", "expirationDateTime"),
            List.of("nameAlreadyExists")));
    }

    // ------------------------------------------------------------------
    // Drive Permission
    // ------------------------------------------------------------------
    private void registerDrivePermission() {
        register(M365Action.rich("drivepermission", "get", "GET",
            "/drives/{driveId}/items/{itemId}/permissions/{permissionId}",
            List.of("driveId", "itemId", "permissionId"), ODataGet, true, false, List.of(),
            "Get a single permission on a drive item.",
            List.of(SCOPE_FILES_READ, SCOPE_SITES_READ), "driveitem-get-permission", M365Action.Support.SUPPORTED,
            List.of("driveId", "itemId", "permissionId"), List.of("id", "roles", "grantedTo"), List.of()));
        register(M365Action.rich("drivepermission", "list", "GET",
            "/drives/{driveId}/items/{itemId}/permissions",
            List.of("driveId", "itemId"), OData, true, true, List.of(),
            "List the permissions on a drive item.",
            List.of(SCOPE_FILES_READ, SCOPE_SITES_READ), "driveitem-list-permissions", M365Action.Support.SUPPORTED,
            List.of("driveId", "itemId"), List.of("value[]"), List.of()));
        register(M365Action.rich("drivepermission", "create", "POST",
            "/drives/{driveId}/items/{itemId}/permissions",
            List.of("driveId", "itemId"), List.of(), true, false, List.of(
                "Payload: {roles, grantedToIdentities} or {@odata.type} link."),
            "Create a sharing permission (link) on a drive item.",
            List.of(SCOPE_FILES_READWRITE, SCOPE_SITES_READWRITE), "driveitem-post-permissions", M365Action.Support.SUPPORTED,
            List.of("roles", "grantedToIdentities"), List.of("id", "link"), List.of("sharingDenied")));
        register(M365Action.rich("drivepermission", "update", "PATCH",
            "/drives/{driveId}/items/{itemId}/permissions/{permissionId}",
            List.of("driveId", "itemId", "permissionId"), List.of(), true, false, List.of(),
            "Update roles on an existing drive item permission.",
            List.of(SCOPE_FILES_READWRITE, SCOPE_SITES_READWRITE), "permission-update", M365Action.Support.SUPPORTED,
            List.of("roles"), List.of("id"), List.of()));
        register(M365Action.rich("drivepermission", "delete", "DELETE",
            "/drives/{driveId}/items/{itemId}/permissions/{permissionId}",
            List.of("driveId", "itemId", "permissionId"), List.of(), true, false, List.of(),
            "Remove a permission from a drive item.",
            List.of(SCOPE_FILES_READWRITE, SCOPE_SITES_READWRITE), "permission-delete", M365Action.Support.SUPPORTED,
            List.of("driveId", "itemId", "permissionId"), List.of(), List.of()));
    }

    // ------------------------------------------------------------------
    // SharePoint Site
    // ------------------------------------------------------------------
    private void registerSharePointSite() {
        register(M365Action.rich("sharepointsite", "get", "GET", "/sites/{siteId}", List.of("siteId"),
            ODataGet, true, false, List.of("siteId may be the id, server-relative path, or full URL."),
            "Get a SharePoint site by id, server-relative path, or URL.",
            List.of(SCOPE_SITES_READ), "site-get", M365Action.Support.SUPPORTED,
            List.of("siteId"), List.of("id", "displayName", "webUrl"), List.of("itemNotFound")));
        register(M365Action.rich("sharepointsite", "list", "GET", "/sites", List.of(),
            OData, true, true, List.of(),
            "List all SharePoint sites (root sites, with OData options).",
            List.of(SCOPE_SITES_READ), "site-list", M365Action.Support.SUPPORTED,
            List.of("$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("sharepointsite", "search", "GET",
            "/sites?search={q}", List.of("q"), List.of("$select"), true, true, List.of(
                "Searches sites by keyword q."),
            "Search SharePoint sites by keyword.",
            List.of(SCOPE_SITES_READ), "site-list", M365Action.Support.SUPPORTED,
            List.of("q"), List.of("value[]"), List.of()));
        register(M365Action.rich("sharepointsite", "create", "POST", "/sites", List.of(),
            List.of(), true, false, List.of("Payload: {displayName, description, sharepointIds}."),
            "Create a SharePoint site.",
            List.of(SCOPE_SITES_READWRITE, SCOPE_DIRECTORY_READWRITE_ALL), "site-post", M365Action.Support.SUPPORTED,
            List.of("displayName", "description"), List.of("id", "webUrl"), List.of()));
        register(M365Action.rich("sharepointsite", "update", "PATCH", "/sites/{siteId}", List.of("siteId"),
            List.of(), true, false, List.of(),
            "Update a SharePoint site (displayName, description).",
            List.of(SCOPE_SITES_READWRITE), "site-update", M365Action.Support.SUPPORTED,
            List.of("displayName", "description"), List.of("id"), List.of()));
        register(M365Action.rich("sharepointsite", "delete", "DELETE", "/sites/{siteId}", List.of("siteId"),
            List.of(), true, false, List.of(),
            "Delete a SharePoint site.",
            List.of(SCOPE_SITES_READWRITE), "site-delete", M365Action.Support.SUPPORTED,
            List.of("siteId"), List.of(), List.of("itemNotFound")));
    }

    // ------------------------------------------------------------------
    // SharePoint List
    // ------------------------------------------------------------------
    private void registerSharePointList() {
        register(M365Action.rich("sharepointlist", "get", "GET", "/sites/{siteId}/lists/{listId}",
            List.of("siteId", "listId"), ODataGet, true, false, List.of(),
            "Get a SharePoint list by id.",
            List.of(SCOPE_SITES_READ), "list-get", M365Action.Support.SUPPORTED,
            List.of("siteId", "listId"), List.of("id", "displayName", "list"), List.of("itemNotFound")));
        register(M365Action.rich("sharepointlist", "list", "GET", "/sites/{siteId}/lists",
            List.of("siteId"), OData, true, true, List.of(),
            "List all lists in a SharePoint site.",
            List.of(SCOPE_SITES_READ), "list-list", M365Action.Support.SUPPORTED,
            List.of("siteId"), List.of("value[]"), List.of()));
        register(M365Action.rich("sharepointlist", "create", "POST", "/sites/{siteId}/lists",
            List.of("siteId"), List.of(), true, false, List.of("Payload: {displayName, list: {template}}."),
            "Create a new SharePoint list.",
            List.of(SCOPE_SITES_READWRITE), "list-create", M365Action.Support.SUPPORTED,
            List.of("displayName", "list"), List.of("id", "displayName"), List.of("invalidRequest")));
        register(M365Action.rich("sharepointlist", "update", "PATCH", "/sites/{siteId}/lists/{listId}",
            List.of("siteId", "listId"), List.of(), true, false, List.of(),
            "Update a SharePoint list (displayName, description).",
            List.of(SCOPE_SITES_READWRITE), "list-update", M365Action.Support.SUPPORTED,
            List.of("displayName", "description"), List.of("id"), List.of()));
        register(M365Action.rich("sharepointlist", "delete", "DELETE", "/sites/{siteId}/lists/{listId}",
            List.of("siteId", "listId"), List.of(), true, false, List.of(),
            "Delete a SharePoint list.",
            List.of(SCOPE_SITES_READWRITE), "list-delete", M365Action.Support.SUPPORTED,
            List.of("siteId", "listId"), List.of(), List.of("itemNotFound")));
    }

    // ------------------------------------------------------------------
    // SharePoint List Item
    // ------------------------------------------------------------------
    private void registerSharePointListItem() {
        register(M365Action.rich("sharepointlistitem", "get", "GET",
            "/sites/{siteId}/lists/{listId}/items/{itemId}",
            List.of("siteId", "listId", "itemId"), ODataGet, true, false, List.of(),
            "Get a single item from a SharePoint list.",
            List.of(SCOPE_SITES_READ), "listitem-get", M365Action.Support.SUPPORTED,
            List.of("siteId", "listId", "itemId"), List.of("id", "fields"), List.of("itemNotFound")));
        register(M365Action.rich("sharepointlistitem", "list", "GET",
            "/sites/{siteId}/lists/{listId}/items",
            List.of("siteId", "listId"), OData, true, true, List.of(),
            "List items in a SharePoint list, with OData filtering and paging.",
            List.of(SCOPE_SITES_READ), "listitem-list", M365Action.Support.SUPPORTED,
            List.of("siteId", "listId", "$expand", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("sharepointlistitem", "create", "POST",
            "/sites/{siteId}/lists/{listId}/items",
            List.of("siteId", "listId"), List.of(), true, false, List.of("Payload: {fields: {...}}."),
            "Create a new item in a SharePoint list.",
            List.of(SCOPE_SITES_READWRITE), "listitem-create", M365Action.Support.SUPPORTED,
            List.of("fields"), List.of("id", "fields"), List.of("invalidRequest")));
        register(M365Action.rich("sharepointlistitem", "update", "PATCH",
            "/sites/{siteId}/lists/{listId}/items/{itemId}",
            List.of("siteId", "listId", "itemId"), List.of(), true, false, List.of("Payload: {fields: {...}}."),
            "Update an item in a SharePoint list.",
            List.of(SCOPE_SITES_READWRITE), "listitem-update", M365Action.Support.SUPPORTED,
            List.of("fields"), List.of("id"), List.of("itemNotFound")));
        register(M365Action.rich("sharepointlistitem", "delete", "DELETE",
            "/sites/{siteId}/lists/{listId}/items/{itemId}",
            List.of("siteId", "listId", "itemId"), List.of(), true, false, List.of(),
            "Delete an item from a SharePoint list.",
            List.of(SCOPE_SITES_READWRITE), "listitem-delete", M365Action.Support.SUPPORTED,
            List.of("siteId", "listId", "itemId"), List.of(), List.of("itemNotFound")));
    }

    // ------------------------------------------------------------------
    // SharePoint Drive
    // ------------------------------------------------------------------
    private void registerSharePointDrive() {
        register(M365Action.rich("sharepointdrive", "get", "GET", "/sites/{siteId}/drive", List.of("siteId"),
            ODataGet, true, false, List.of(),
            "Get the default document library drive of a SharePoint site.",
            List.of(SCOPE_SITES_READ), "drive-get", M365Action.Support.SUPPORTED,
            List.of("siteId"), List.of("id", "driveType"), List.of()));
        register(M365Action.rich("sharepointdrive", "list", "GET", "/sites/{siteId}/drives", List.of("siteId"),
            OData, true, true, List.of(),
            "List the document libraries (drives) of a SharePoint site.",
            List.of(SCOPE_SITES_READ), "drive-list", M365Action.Support.SUPPORTED,
            List.of("siteId"), List.of("value[]"), List.of()));
        register(M365Action.rich("sharepointdrive", "upload", "PUT",
            "/sites/{siteId}/drive/items/{parentId}:/{filename}:/content",
            List.of("siteId", "parentId", "filename"), List.of(), true, false, List.of(
                "Payload: the file content; content or base64."),
            "Upload a file into a SharePoint document library.",
            List.of(SCOPE_SITES_READWRITE), "driveitem-put-content", M365Action.Support.SUPPORTED,
            List.of("filename", "content"), List.of("id", "name", "size"), List.of("itemNotFound")));
        register(M365Action.rich("sharepointdrive", "download", "GET",
            "/sites/{siteId}/drive/items/{itemId}/content", List.of("siteId", "itemId"),
            List.of(), true, false, List.of("Base64-encoded in the envelope."),
            "Download a file from a SharePoint document library.",
            List.of(SCOPE_SITES_READ), "driveitem-get-content", M365Action.Support.SUPPORTED,
            List.of("siteId", "itemId"), List.of("content (base64)"), List.of("itemNotFound")));
        register(M365Action.rich("sharepointdrive", "update", "PATCH", "/sites/{siteId}/drive/items/{itemId}",
            List.of("siteId", "itemId"), List.of(), true, false, List.of(),
            "Update SharePoint drive item metadata.",
            List.of(SCOPE_SITES_READWRITE), "driveitem-update", M365Action.Support.SUPPORTED,
            List.of("name"), List.of("id", "name"), List.of("itemNotFound")));
        register(M365Action.rich("sharepointdrive", "delete", "DELETE", "/sites/{siteId}/drive/items/{itemId}",
            List.of("siteId", "itemId"), List.of(), true, false, List.of(),
            "Delete a file from a SharePoint document library.",
            List.of(SCOPE_SITES_READWRITE), "driveitem-delete", M365Action.Support.SUPPORTED,
            List.of("siteId", "itemId"), List.of(), List.of("itemNotFound")));
        register(M365Action.rich("sharepointdrive", "copy", "POST", "/sites/{siteId}/drive/items/{itemId}/copy",
            List.of("siteId", "itemId"), List.of(), true, false, List.of("Payload: {parentReference, name}."),
            "Copy a SharePoint drive item to another location.",
            List.of(SCOPE_SITES_READWRITE), "driveitem-copy", M365Action.Support.SUPPORTED,
            List.of("parentReference", "name"), List.of(), List.of()));
        register(M365Action.rich("sharepointdrive", "move", "PATCH", "/sites/{siteId}/drive/items/{itemId}",
            List.of("siteId", "itemId"), List.of(), true, false, List.of("Payload: {parentReference, name}."),
            "Move a SharePoint drive item to another location or rename it.",
            List.of(SCOPE_SITES_READWRITE), "driveitem-update", M365Action.Support.SUPPORTED,
            List.of("parentReference", "name"), List.of("id", "name"), List.of("itemNotFound")));
    }

    // ------------------------------------------------------------------
    // Teams
    // ------------------------------------------------------------------
    private void registerTeams() {
        register(M365Action.rich("teams", "get", "GET", "/teams/{teamId}", List.of("teamId"),
            ODataGet, true, false, List.of(),
            "Get the properties of a Microsoft Teams team.",
            List.of(SCOPE_TEAM_READ), "team-get", M365Action.Support.SUPPORTED,
            List.of("teamId"), List.of("id", "displayName", "visibility"), List.of("itemNotFound")));
        register(M365Action.rich("teams", "list", "GET", "/groups?$filter=resourceProvisioningOptions/Any(x:x eq 'Team')",
            List.of(), List.of("$select", "$top"), true, true, List.of("Lists groups with teams; expect a group-based payload."),
            "List all teams (via the Microsoft 365 groups that back them).",
            List.of(SCOPE_GROUP_READ_ALL, SCOPE_TEAM_READ), "group-list", M365Action.Support.SUPPORTED,
            List.of("$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("teams", "create", "POST", "/teams", List.of(),
            List.of(), true, false, List.of("Payload: {template@odata.bind, displayName, description, ...}."),
            "Create a new Microsoft Teams team.",
            List.of(SCOPE_TEAM_READWRITE, SCOPE_GROUP_READWRITE_ALL), "team-post", M365Action.Support.SUPPORTED,
            List.of("displayName", "description"), List.of("id", "displayName"), List.of("Request_BadRequest")));
        register(M365Action.rich("teams", "update", "PATCH", "/teams/{teamId}", List.of("teamId"),
            List.of(), true, false, List.of(),
            "Update the properties of a team.",
            List.of(SCOPE_TEAM_READWRITE), "team-update", M365Action.Support.SUPPORTED,
            List.of("displayName", "description"), List.of("id"), List.of()));
        register(M365Action.rich("teams", "delete", "DELETE", "/groups/{teamId}", List.of("teamId"),
            List.of(), true, false, List.of("Deletes the underlying Microsoft 365 group."),
            "Delete a team (and its underlying Microsoft 365 group).",
            List.of(SCOPE_GROUP_READWRITE_ALL), "group-delete", M365Action.Support.SUPPORTED,
            List.of("teamId"), List.of(), List.of("Request_ResourceNotFound")));
        register(M365Action.rich("teams", "archive", "POST", "/teams/{teamId}/archive", List.of("teamId"),
            List.of(), true, false, List.of("Payload optional: {shouldSetSpoSiteReadOnlyForMembers}."),
            "Archive a team.",
            List.of(SCOPE_TEAM_READWRITE), "team-archive", M365Action.Support.SUPPORTED,
            List.of("shouldSetSpoSiteReadOnlyForMembers"), List.of(), List.of()));
        register(M365Action.rich("teams", "unarchive", "POST", "/teams/{teamId}/unarchive", List.of("teamId"),
            List.of(), true, false, List.of(),
            "Restore an archived team.",
            List.of(SCOPE_TEAM_READWRITE), "team-unarchive", M365Action.Support.SUPPORTED,
            List.of("teamId"), List.of(), List.of()));
        register(M365Action.rich("teams", "clone", "POST", "/teams/{teamId}/clone", List.of("teamId"),
            List.of(), true, false, List.of("Payload: {displayName, description, mailNickname, partsToClone, visibility}."),
            "Clone an existing team (channels, apps, tabs, settings).",
            List.of(SCOPE_TEAM_READWRITE), "team-clone", M365Action.Support.SUPPORTED,
            List.of("displayName", "mailNickname", "partsToClone"), List.of(), List.of("ResourceInUse")));
    }

    // ------------------------------------------------------------------
    // Teams Channel
    // ------------------------------------------------------------------
    private void registerTeamsChannel() {
        register(M365Action.rich("teamschannel", "get", "GET", "/teams/{teamId}/channels/{channelId}",
            List.of("teamId", "channelId"), ODataGet, true, false, List.of(),
            "Get a single channel in a team.",
            List.of(SCOPE_CHANNEL_READ_ALL), "channel-get", M365Action.Support.SUPPORTED,
            List.of("teamId", "channelId"), List.of("id", "displayName", "description"), List.of("itemNotFound")));
        register(M365Action.rich("teamschannel", "list", "GET", "/teams/{teamId}/channels",
            List.of("teamId"), OData, true, true, List.of(),
            "List all channels in a team.",
            List.of(SCOPE_CHANNEL_READ_ALL), "channel-list", M365Action.Support.SUPPORTED,
            List.of("teamId"), List.of("value[]"), List.of()));
        register(M365Action.rich("teamschannel", "create", "POST", "/teams/{teamId}/channels",
            List.of("teamId"), List.of(), true, false, List.of("Payload: {displayName, description}."),
            "Create a new channel in a team.",
            List.of(SCOPE_TEAM_READWRITE), "channel-post", M365Action.Support.SUPPORTED,
            List.of("displayName", "description"), List.of("id", "displayName"), List.of("nameAlreadyExists")));
        register(M365Action.rich("teamschannel", "update", "PATCH", "/teams/{teamId}/channels/{channelId}",
            List.of("teamId", "channelId"), List.of(), true, false, List.of(),
            "Update a channel (description, displayName).",
            List.of(SCOPE_TEAM_READWRITE), "channel-patch", M365Action.Support.SUPPORTED,
            List.of("displayName", "description"), List.of("id"), List.of()));
        register(M365Action.rich("teamschannel", "delete", "DELETE", "/teams/{teamId}/channels/{channelId}",
            List.of("teamId", "channelId"), List.of(), true, false, List.of(),
            "Delete a channel from a team.",
            List.of(SCOPE_TEAM_READWRITE), "channel-delete", M365Action.Support.SUPPORTED,
            List.of("teamId", "channelId"), List.of(), List.of("itemNotFound")));
        register(M365Action.rich("teamschannel", "archive", "POST", "/teams/{teamId}/channels/{channelId}/archive",
            List.of("teamId", "channelId"), List.of(), true, false, List.of(),
            "Archive a channel.",
            List.of(SCOPE_TEAM_READWRITE), "channel-archive", M365Action.Support.SUPPORTED,
            List.of("teamId", "channelId"), List.of(), List.of()));
        register(M365Action.rich("teamschannel", "unarchive", "POST", "/teams/{teamId}/channels/{channelId}/unarchive",
            List.of("teamId", "channelId"), List.of(), true, false, List.of(),
            "Restore an archived channel.",
            List.of(SCOPE_TEAM_READWRITE), "channel-unarchive", M365Action.Support.SUPPORTED,
            List.of("teamId", "channelId"), List.of(), List.of()));
    }

    // ------------------------------------------------------------------
    // Teams Member
    // ------------------------------------------------------------------
    private void registerTeamsMember() {
        register(M365Action.rich("teamsmember", "get", "GET",
            "/teams/{teamId}/members/{membershipId}", List.of("teamId", "membershipId"),
            ODataGet, true, false, List.of(),
            "Get a single member of a team.",
            List.of(SCOPE_TEAM_READ, SCOPE_GROUP_READ_ALL), "conversationmember-get", M365Action.Support.SUPPORTED,
            List.of("teamId", "membershipId"), List.of("id", "displayName", "roles"), List.of()));
        register(M365Action.rich("teamsmember", "list", "GET", "/teams/{teamId}/members",
            List.of("teamId"), OData, true, true, List.of(),
            "List members of a team.",
            List.of(SCOPE_TEAM_READ, SCOPE_GROUP_READ_ALL), "conversationmember-list", M365Action.Support.SUPPORTED,
            List.of("teamId"), List.of("value[]"), List.of()));
        register(M365Action.rich("teamsmember", "add", "POST", "/teams/{teamId}/members",
            List.of("teamId"), List.of(), true, false, List.of(
                "Payload: {\"@odata.type\": \"#microsoft.graph.aadUserConversationMember\", roles, user@odata.bind}."),
            "Add a member (user) to a team.",
            List.of(SCOPE_TEAM_READWRITE, SCOPE_GROUP_READWRITE_ALL), "conversationmember-add", M365Action.Support.SUPPORTED,
            List.of("roles", "user@odata.bind"), List.of("id"), List.of("Request_BadRequest")));
        register(M365Action.rich("teamsmember", "update", "PATCH", "/teams/{teamId}/members/{membershipId}",
            List.of("teamId", "membershipId"), List.of(), true, false, List.of("Payload: {roles}."),
            "Update the roles of a team member.",
            List.of(SCOPE_TEAM_READWRITE, SCOPE_GROUP_READWRITE_ALL), "conversationmember-update", M365Action.Support.SUPPORTED,
            List.of("roles"), List.of("id"), List.of()));
        register(M365Action.rich("teamsmember", "remove", "DELETE", "/teams/{teamId}/members/{membershipId}",
            List.of("teamId", "membershipId"), List.of(), true, false, List.of(),
            "Remove a member from a team.",
            List.of(SCOPE_TEAM_READWRITE, SCOPE_GROUP_READWRITE_ALL), "conversationmember-delete", M365Action.Support.SUPPORTED,
            List.of("teamId", "membershipId"), List.of(), List.of()));
    }

    // ------------------------------------------------------------------
    // Teams Message
    // ------------------------------------------------------------------
    private void registerTeamsMessage() {
        register(M365Action.rich("teamsmessage", "get", "GET",
            "/teams/{teamId}/channels/{channelId}/messages/{messageId}",
            List.of("teamId", "channelId", "messageId"), ODataGet, true, false, List.of(),
            "Get a single channel message.",
            List.of(SCOPE_CHANNEL_READ_ALL), "chatmessage-get", M365Action.Support.SUPPORTED,
            List.of("teamId", "channelId", "messageId"), List.of("id", "body", "from"), List.of("itemNotFound")));
        register(M365Action.rich("teamsmessage", "list", "GET",
            "/teams/{teamId}/channels/{channelId}/messages",
            List.of("teamId", "channelId"), OData, true, true, List.of(),
            "List messages in a channel.",
            List.of(SCOPE_CHANNEL_READ_ALL), "chatmessage-list", M365Action.Support.SUPPORTED,
            List.of("teamId", "channelId", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("teamsmessage", "send", "POST",
            "/teams/{teamId}/channels/{channelId}/messages",
            List.of("teamId", "channelId"), List.of(), true, false, List.of("Payload: {body: {content, contentType}}."),
            "Send a message to a channel.",
            List.of(SCOPE_CHANNEL_MESSAGE), "chatmessage-post", M365Action.Support.SUPPORTED,
            List.of("body"), List.of("id", "body"), List.of("messageSizeLimitReached")));
        register(M365Action.rich("teamsmessage", "update", "PATCH",
            "/teams/{teamId}/channels/{channelId}/messages/{messageId}",
            List.of("teamId", "channelId", "messageId"), List.of(), true, false, List.of(),
            "Update a channel message.",
            List.of(SCOPE_CHANNEL_MESSAGE, "ChannelMessage.ReadWrite.All"), "chatmessage-update", M365Action.Support.SUPPORTED,
            List.of("body"), List.of("id"), List.of()));
        register(M365Action.rich("teamsmessage", "delete", "DELETE",
            "/teams/{teamId}/channels/{channelId}/messages/{messageId}",
            List.of("teamId", "channelId", "messageId"), List.of(), true, false, List.of(),
            "Soft-delete a channel message.",
            List.of(SCOPE_CHANNEL_MESSAGE, "ChannelMessage.ReadWrite.All"), "chatmessage-delete", M365Action.Support.SUPPORTED,
            List.of("teamId", "channelId", "messageId"), List.of(), List.of()));
        register(M365Action.rich("teamsmessage", "reply", "POST",
            "/teams/{teamId}/channels/{channelId}/messages/{messageId}/replies",
            List.of("teamId", "channelId", "messageId"), List.of(), true, false, List.of("Payload: {body}."),
            "Reply to a channel message.",
            List.of(SCOPE_CHANNEL_MESSAGE), "chatmessage-post", M365Action.Support.SUPPORTED,
            List.of("body"), List.of("id"), List.of()));
        register(M365Action.rich("teamsmessage", "forward", "POST",
            "/teams/{teamId}/channels/{channelId}/messages/{messageId}/forward",
            List.of("teamId", "channelId", "messageId"), List.of(), true, false, List.of(
                "Payload: {messageIds: [], contentType, targetChatId}."),
            "Forward a message to another chat or channel.",
            List.of(SCOPE_CHANNEL_MESSAGE), "chatmessage-forward", M365Action.Support.SUPPORTED,
            List.of("messageIds", "contentType", "targetChatId"), List.of(), List.of()));
    }

    // ------------------------------------------------------------------
    // Teams Chat
    // ------------------------------------------------------------------
    private void registerTeamsChat() {
        register(M365Action.rich("teamschat", "get", "GET", "/chats/{chatId}", List.of("chatId"),
            ODataGet, true, false, List.of(),
            "Get a single 1:1 or group chat.",
            List.of(SCOPE_CHAT_READ), "chat-get", M365Action.Support.SUPPORTED,
            List.of("chatId"), List.of("id", "chatType", "topic"), List.of("itemNotFound")));
        register(M365Action.rich("teamschat", "list", "GET", "/chats", List.of(),
            OData, true, true, List.of("Lists the signed-in user's chats."),
            "List the signed-in user's chats.",
            List.of(SCOPE_CHAT_READ), "chat-list", M365Action.Support.SUPPORTED,
            List.of("$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("teamschat", "create", "POST", "/chats", List.of(),
            List.of(), true, false, List.of("Payload: {chatType, topic, members}."),
            "Create a new chat.",
            List.of(SCOPE_CHAT_READWRITE), "chat-post", M365Action.Support.SUPPORTED,
            List.of("chatType", "topic", "members"), List.of("id", "chatType"), List.of("Request_BadRequest")));
        register(M365Action.rich("teamschat", "update", "PATCH", "/chats/{chatId}", List.of("chatId"),
            List.of(), true, false, List.of("Payload: {topic}."),
            "Update a chat (e.g. topic).",
            List.of(SCOPE_CHAT_READWRITE), "chat-patch", M365Action.Support.SUPPORTED,
            List.of("topic"), List.of("id"), List.of()));
        register(M365Action.rich("teamschat", "delete", "DELETE", "/chats/{chatId}", List.of("chatId"),
            List.of(), true, false, List.of("Archives the chat via the API."),
            "Archive a chat.",
            List.of(SCOPE_CHAT_READWRITE), "chat-delete", M365Action.Support.SUPPORTED,
            List.of("chatId"), List.of(), List.of("itemNotFound")));
    }

    // ------------------------------------------------------------------
    // Teams Chat Member
    // ------------------------------------------------------------------
    private void registerTeamsChatMember() {
        register(M365Action.rich("teamschatmember", "list", "GET", "/chats/{chatId}/members",
            List.of("chatId"), OData, true, true, List.of(),
            "List members of a chat.",
            List.of(SCOPE_CHAT_READ), "conversationmember-list", M365Action.Support.SUPPORTED,
            List.of("chatId"), List.of("value[]"), List.of()));
        register(M365Action.rich("teamschatmember", "add", "POST", "/chats/{chatId}/members",
            List.of("chatId"), List.of(), true, false, List.of(
                "Payload: {@odata.type: conversationMember, roles, user@odata.bind}."),
            "Add a member to a chat.",
            List.of(SCOPE_CHAT_READWRITE), "conversationmember-post", M365Action.Support.SUPPORTED,
            List.of("roles", "user@odata.bind"), List.of("id"), List.of()));
        register(M365Action.rich("teamschatmember", "remove", "DELETE", "/chats/{chatId}/members/{membershipId}",
            List.of("chatId", "membershipId"), List.of(), true, false, List.of(),
            "Remove a member from a chat.",
            List.of(SCOPE_CHAT_READWRITE), "conversationmember-delete", M365Action.Support.SUPPORTED,
            List.of("chatId", "membershipId"), List.of(), List.of()));
        register(M365Action.rich("teamschatmember", "update", "PATCH", "/chats/{chatId}/members/{membershipId}",
            List.of("chatId", "membershipId"), List.of(), true, false, List.of(),
            "Update a chat member's roles.",
            List.of(SCOPE_CHAT_READWRITE), "conversationmember-update", M365Action.Support.SUPPORTED,
            List.of("roles"), List.of("id"), List.of()));
    }

    // ------------------------------------------------------------------
    // Teams Meeting
    // ------------------------------------------------------------------
    private void registerTeamsMeeting() {
        register(M365Action.rich("teamsmeeting", "get", "GET", "/users/{userId}/onlineMeetings/{meetingId}",
            List.of("userId", "meetingId"), ODataGet, true, false, List.of(),
            "Get an online meeting.",
            List.of(SCOPE_ONLINE_MEETINGS_READ), "onlinemeeting-get", M365Action.Support.SUPPORTED,
            List.of("userId", "meetingId"), List.of("id", "subject", "joinWebUrl"), List.of("itemNotFound")));
        register(M365Action.rich("teamsmeeting", "list", "GET", "/users/{userId}/onlineMeetings",
            List.of("userId"), OData, true, true, List.of(),
            "List online meetings of a user.",
            List.of(SCOPE_ONLINE_MEETINGS_READ), "onlinemeeting-list", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("teamsmeeting", "create", "POST", "/users/{userId}/onlineMeetings",
            List.of("userId"), List.of(), true, false, List.of("Payload: {startDateTime, endDateTime, subject, ...}."),
            "Create an online (Teams) meeting.",
            List.of(SCOPE_ONLINE_MEETINGS_READWRITE), "onlinemeeting-create", M365Action.Support.SUPPORTED,
            List.of("startDateTime", "endDateTime", "subject"), List.of("id", "joinWebUrl"), List.of("Request_BadRequest")));
        register(M365Action.rich("teamsmeeting", "update", "PATCH", "/users/{userId}/onlineMeetings/{meetingId}",
            List.of("userId", "meetingId"), List.of(), true, false, List.of(),
            "Update an online meeting.",
            List.of(SCOPE_ONLINE_MEETINGS_READWRITE), "onlinemeeting-update", M365Action.Support.SUPPORTED,
            List.of("subject", "startDateTime"), List.of("id"), List.of()));
        register(M365Action.rich("teamsmeeting", "cancel", "DELETE", "/users/{userId}/onlineMeetings/{meetingId}",
            List.of("userId", "meetingId"), List.of(), true, false, List.of(),
            "Cancel/delete an online meeting.",
            List.of(SCOPE_ONLINE_MEETINGS_READWRITE), "onlinemeeting-delete", M365Action.Support.SUPPORTED,
            List.of("userId", "meetingId"), List.of(), List.of("itemNotFound")));
    }

    // ------------------------------------------------------------------
    // Teams Call
    // ------------------------------------------------------------------
    private void registerTeamsCall() {
        register(M365Action.rich("teamscall", "get", "GET", "/communications/calls/{callId}",
            List.of("callId"), ODataGet, true, false, List.of(),
            "Get a call (app-only context).",
            List.of("Calls.JoinGroupCall.All", "Calls.InitiateGroupCall.All"), "call-get", M365Action.Support.SUPPORTED,
            List.of("callId"), List.of("id", "state", "direction"), List.of("itemNotFound")));
        register(M365Action.rich("teamscall", "list", "GET", "/communications/calls",
            List.of(), OData, true, true, List.of("Lists calls for the app; requires app-only auth."),
            "List calls for the application (app-only).",
            List.of("Calls.InitiateGroupCall.All"), "call-list", M365Action.Support.SUPPORTED,
            List.of("$top"), List.of("value[]"), List.of()));
    }

    // ------------------------------------------------------------------
    // OneDrive
    // ------------------------------------------------------------------
    private void registerOneDrive() {
        register(M365Action.rich("onedrive", "get", "GET", "/me/drive", List.of(),
            ODataGet, true, false, List.of(),
            "Get the signed-in user's default OneDrive drive.",
            List.of(SCOPE_FILES_READ), "drive-get", M365Action.Support.SUPPORTED,
            List.of(), List.of("id", "driveType", "owner"), List.of()));
        register(M365Action.rich("onedrive", "list", "GET", "/me/drive/root/children", List.of(),
            OData, true, true, List.of(),
            "List files and folders in the root of the user's OneDrive.",
            List.of(SCOPE_FILES_READ), "driveitem-list-children", M365Action.Support.SUPPORTED,
            List.of("$top", "$filter"), List.of("value[]"), List.of()));
        register(M365Action.rich("onedrive", "upload", "PUT", "/me/drive/items/{parentId}:/{filename}:/content",
            List.of("parentId", "filename"), List.of(), true, false, List.of("Payload = file content."),
            "Upload (or replace) a file in OneDrive.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-put-content", M365Action.Support.SUPPORTED,
            List.of("filename", "content"), List.of("id", "name", "size"), List.of("itemNotFound")));
        register(M365Action.rich("onedrive", "download", "GET", "/me/drive/items/{itemId}/content",
            List.of("itemId"), List.of(), true, false, List.of("Base64-encoded in the envelope."),
            "Download a file from OneDrive.",
            List.of(SCOPE_FILES_READ), "driveitem-get-content", M365Action.Support.SUPPORTED,
            List.of("itemId"), List.of("content (base64)"), List.of("itemNotFound")));
        register(M365Action.rich("onedrive", "update", "PATCH", "/me/drive/items/{itemId}",
            List.of("itemId"), List.of(), true, false, List.of(),
            "Update OneDrive item metadata (e.g. rename).",
            List.of(SCOPE_FILES_READWRITE), "driveitem-update", M365Action.Support.SUPPORTED,
            List.of("name"), List.of("id", "name"), List.of("itemNotFound")));
        register(M365Action.rich("onedrive", "delete", "DELETE", "/me/drive/items/{itemId}",
            List.of("itemId"), List.of(), true, false, List.of(),
            "Delete a file or folder from OneDrive.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-delete", M365Action.Support.SUPPORTED,
            List.of("itemId"), List.of(), List.of("itemNotFound")));
        register(M365Action.rich("onedrive", "copy", "POST", "/me/drive/items/{itemId}/copy",
            List.of("itemId"), List.of(), true, false, List.of("Payload: {parentReference, name}."),
            "Copy a OneDrive item to another location.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-copy", M365Action.Support.SUPPORTED,
            List.of("parentReference", "name"), List.of(), List.of()));
        register(M365Action.rich("onedrive", "move", "PATCH", "/me/drive/items/{itemId}",
            List.of("itemId"), List.of(), true, false, List.of("Payload: {parentReference, name}."),
            "Move a OneDrive item to another location or rename it.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-update", M365Action.Support.SUPPORTED,
            List.of("parentReference", "name"), List.of("id", "name"), List.of("itemNotFound")));
        register(M365Action.rich("onedrive", "create-folder", "POST", "/me/drive/root/children",
            List.of(), List.of(), true, false, List.of("Payload: {name, folder: {}, @microsoft.graph.conflictBehavior}."),
            "Create a folder in the root of OneDrive.",
            List.of(SCOPE_FILES_READWRITE), "driveitem-post-children", M365Action.Support.SUPPORTED,
            List.of("name", "folder"), List.of("id", "name"), List.of("nameAlreadyExists")));
        register(M365Action.rich("onedrive", "search", "GET", "/me/drive/root/search(q='{q}')",
            List.of("q"), List.of("$select"), true, true, List.of(),
            "Search OneDrive files and folders by keyword.",
            List.of(SCOPE_FILES_READ), "driveitem-search", M365Action.Support.SUPPORTED,
            List.of("q"), List.of("value[]"), List.of()));
    }

    // ------------------------------------------------------------------
    // Directory
    // ------------------------------------------------------------------
    private void registerDirectory() {
        register(M365Action.rich("directory", "search", "GET",
            "/directoryObjects?$search={query}", List.of("query"),
            List.of("$select", "$top"), true, false, List.of("Searches directory objects by query string."),
            "Search directory objects (users, groups, devices, apps) by keyword.",
            List.of(SCOPE_DIRECTORY_READ_ALL), "directoryobject-list", M365Action.Support.SUPPORTED,
            List.of("query", "$search"), List.of("value[]"), List.of("Request_UnsupportedQuery")));
        register(M365Action.rich("directory", "list-users", "GET", "/users", List.of(),
            OData, true, true, List.of(),
            "List all users in the tenant.",
            List.of(SCOPE_USER_READ_ALL, SCOPE_DIRECTORY_READ_ALL), "user-list", M365Action.Support.SUPPORTED,
            List.of("$filter", "$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("directory", "list-groups", "GET", "/groups", List.of(),
            OData, true, true, List.of(),
            "List all groups in the tenant.",
            List.of(SCOPE_GROUP_READ_ALL, SCOPE_DIRECTORY_READ_ALL), "group-list", M365Action.Support.SUPPORTED,
            List.of("$filter", "$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("directory", "list-contacts", "GET", "/contacts", List.of(),
            OData, true, true, List.of(),
            "List organizational contacts in the tenant.",
            List.of(SCOPE_DIRECTORY_READ_ALL), "orgcontact-list", M365Action.Support.SUPPORTED,
            List.of("$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("directory", "list-devices", "GET", "/devices", List.of(),
            OData, true, true, List.of(),
            "List registered devices in the tenant.",
            List.of(SCOPE_DEVICE_READ, SCOPE_DIRECTORY_READ_ALL), "device-list", M365Action.Support.SUPPORTED,
            List.of("$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("directory", "list-applications", "GET", "/applications", List.of(),
            OData, true, true, List.of(),
            "List applications registered in the tenant.",
            List.of(SCOPE_APPLICATION_READWRITE, SCOPE_DIRECTORY_READ_ALL), "application-list", M365Action.Support.SUPPORTED,
            List.of("$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("directory", "list-service-principals", "GET", "/servicePrincipals", List.of(),
            OData, true, true, List.of(),
            "List service principals in the tenant.",
            List.of(SCOPE_DIRECTORY_READ_ALL, SCOPE_APPLICATION_READWRITE), "serviceprincipal-list", M365Action.Support.SUPPORTED,
            List.of("$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("directory", "list-objects", "GET", "/directoryObjects", List.of(),
            OData, true, true, List.of("Lists directory objects by ids (payload: {ids})."),
            "Get directory objects by their ids.",
            List.of(SCOPE_DIRECTORY_READ_ALL), "directoryobject-getByIds", M365Action.Support.SUPPORTED,
            List.of("ids"), List.of("value[]"), List.of()));
    }

    // ------------------------------------------------------------------
    // Organization
    // ------------------------------------------------------------------
    private void registerOrganization() {
        register(M365Action.rich("organization", "get", "GET", "/organization/{organizationId}",
            List.of("organizationId"), ODataGet, true, false, List.of(),
            "Get a specific organization (tenant) profile.",
            List.of(SCOPE_ORG_READ), "organization-get", M365Action.Support.SUPPORTED,
            List.of("organizationId"), List.of("id", "displayName", "verifiedDomains"), List.of()));
        register(M365Action.rich("organization", "list", "GET", "/organization", List.of(),
            ODataGet, true, false, List.of("Lists the signed-in tenant's organization(s)."),
            "List the organizations the signed-in identity belongs to.",
            List.of(SCOPE_ORG_READ), "organization-list", M365Action.Support.SUPPORTED,
            List.of(), List.of("value[]"), List.of()));
    }

    // ------------------------------------------------------------------
    // Device
    // ------------------------------------------------------------------
    private void registerDevice() {
        register(M365Action.rich("device", "get", "GET", "/devices/{deviceId}", List.of("deviceId"),
            ODataGet, true, false, List.of(),
            "Get a registered device by id.",
            List.of(SCOPE_DEVICE_READ, SCOPE_DIRECTORY_READ_ALL), "device-get", M365Action.Support.SUPPORTED,
            List.of("deviceId"), List.of("id", "displayName", "operatingSystem"), List.of("Request_ResourceNotFound")));
        register(M365Action.rich("device", "list", "GET", "/devices", List.of(),
            OData, true, true, List.of(),
            "List registered devices in the tenant.",
            List.of(SCOPE_DEVICE_READ, SCOPE_DIRECTORY_READ_ALL), "device-list", M365Action.Support.SUPPORTED,
            List.of("$filter", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("device", "create", "POST", "/devices", List.of(),
            List.of(), true, false, List.of("Payload: {deviceId, operatingSystem, ...}."),
            "Register a new device.",
            List.of(SCOPE_DIRECTORY_READWRITE_ALL), "device-post", M365Action.Support.SUPPORTED,
            List.of("deviceId", "operatingSystem", "displayName"), List.of("id", "deviceId"), List.of("Request_BadRequest")));
        register(M365Action.rich("device", "update", "PATCH", "/devices/{deviceId}", List.of("deviceId"),
            List.of(), true, false, List.of(),
            "Update a registered device.",
            List.of(SCOPE_DIRECTORY_READWRITE_ALL, SCOPE_DEVICE_READWRITE), "device-update", M365Action.Support.SUPPORTED,
            List.of("displayName", "operatingSystem"), List.of("id"), List.of()));
        register(M365Action.rich("device", "delete", "DELETE", "/devices/{deviceId}", List.of("deviceId"),
            List.of(), true, false, List.of(),
            "Delete a registered device.",
            List.of(SCOPE_DIRECTORY_READWRITE_ALL, SCOPE_DEVICE_READWRITE), "device-delete", M365Action.Support.SUPPORTED,
            List.of("deviceId"), List.of(), List.of("Request_ResourceNotFound")));
    }

    // ------------------------------------------------------------------
    // Application
    // ------------------------------------------------------------------
    private void registerApplication() {
        register(M365Action.rich("application", "get", "GET", "/applications/{applicationId}",
            List.of("applicationId"), ODataGet, true, false, List.of(),
            "Get an application registration by id.",
            List.of(SCOPE_APPLICATION_READWRITE, SCOPE_DIRECTORY_READ_ALL), "application-get", M365Action.Support.SUPPORTED,
            List.of("applicationId"), List.of("id", "displayName", "appId"), List.of("Request_ResourceNotFound")));
        register(M365Action.rich("application", "list", "GET", "/applications", List.of(),
            OData, true, true, List.of(),
            "List application registrations in the tenant.",
            List.of(SCOPE_APPLICATION_READWRITE, SCOPE_DIRECTORY_READ_ALL), "application-list", M365Action.Support.SUPPORTED,
            List.of("$filter", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("application", "create", "POST", "/applications", List.of(),
            List.of(), true, false, List.of("Payload: {displayName, signInAudience, ...}."),
            "Create a new application registration.",
            List.of(SCOPE_APPLICATION_READWRITE), "application-post", M365Action.Support.SUPPORTED,
            List.of("displayName", "signInAudience"), List.of("id", "appId"), List.of("Request_BadRequest")));
        register(M365Action.rich("application", "update", "PATCH", "/applications/{applicationId}",
            List.of("applicationId"), List.of(), true, false, List.of(),
            "Update an application registration.",
            List.of(SCOPE_APPLICATION_READWRITE), "application-update", M365Action.Support.SUPPORTED,
            List.of("displayName"), List.of("id"), List.of()));
        register(M365Action.rich("application", "delete", "DELETE", "/applications/{applicationId}",
            List.of("applicationId"), List.of(), true, false, List.of(),
            "Delete an application registration.",
            List.of(SCOPE_APPLICATION_READWRITE), "application-delete", M365Action.Support.SUPPORTED,
            List.of("applicationId"), List.of(), List.of("Request_ResourceNotFound")));
    }

    // ------------------------------------------------------------------
    // Service Principal
    // ------------------------------------------------------------------
    private void registerServicePrincipal() {
        register(M365Action.rich("serviceprincipal", "get", "GET", "/servicePrincipals/{servicePrincipalId}",
            List.of("servicePrincipalId"), ODataGet, true, false, List.of(),
            "Get a service principal by id.",
            List.of(SCOPE_DIRECTORY_READ_ALL, SCOPE_APPLICATION_READWRITE), "serviceprincipal-get", M365Action.Support.SUPPORTED,
            List.of("servicePrincipalId"), List.of("id", "displayName", "appId"), List.of("Request_ResourceNotFound")));
        register(M365Action.rich("serviceprincipal", "list", "GET", "/servicePrincipals", List.of(),
            OData, true, true, List.of(),
            "List service principals in the tenant.",
            List.of(SCOPE_DIRECTORY_READ_ALL, SCOPE_APPLICATION_READWRITE), "serviceprincipal-list", M365Action.Support.SUPPORTED,
            List.of("$filter", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("serviceprincipal", "create", "POST", "/servicePrincipals", List.of(),
            List.of(), true, false, List.of("Payload: {appId, displayName, ...}."),
            "Create a service principal for an application.",
            List.of(SCOPE_APPLICATION_READWRITE), "serviceprincipal-post", M365Action.Support.SUPPORTED,
            List.of("appId", "displayName"), List.of("id", "appId"), List.of("Request_BadRequest")));
        register(M365Action.rich("serviceprincipal", "update", "PATCH", "/servicePrincipals/{servicePrincipalId}",
            List.of("servicePrincipalId"), List.of(), true, false, List.of(),
            "Update a service principal.",
            List.of(SCOPE_APPLICATION_READWRITE), "serviceprincipal-update", M365Action.Support.SUPPORTED,
            List.of("displayName"), List.of("id"), List.of()));
        register(M365Action.rich("serviceprincipal", "delete", "DELETE", "/servicePrincipals/{servicePrincipalId}",
            List.of("servicePrincipalId"), List.of(), true, false, List.of(),
            "Delete a service principal.",
            List.of(SCOPE_APPLICATION_READWRITE), "serviceprincipal-delete", M365Action.Support.SUPPORTED,
            List.of("servicePrincipalId"), List.of(), List.of("Request_ResourceNotFound")));
    }

    // ------------------------------------------------------------------
    // Presence
    // ------------------------------------------------------------------
    private void registerPresence() {
        register(M365Action.rich("presence", "get", "GET", "/users/{userId}/presence", List.of("userId"),
            ODataGet, true, false, List.of(),
            "Get the presence (availability) of a user.",
            List.of(SCOPE_PRESENCE_READ), "presence-get", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("id", "availability", "activity"), List.of()));
        register(M365Action.rich("presence", "list", "GET", "/communications/getPresencesByUserId",
            List.of(), List.of(), true, false, List.of("Payload: {ids: [userId...]}. POST semantics."),
            "Get presence for multiple users.",
            List.of(SCOPE_PRESENCE_READ), "cloudcommunication-getpresencesbyuserid", M365Action.Support.SUPPORTED,
            List.of("ids"), List.of("value[]"), List.of()));
        register(M365Action.rich("presence", "set", "POST", "/users/{userId}/presence/setPresence",
            List.of("userId"), List.of(), true, false, List.of("Payload: {sessionId, availability, activity}."),
            "Set a user's presence.",
            List.of(SCOPE_PRESENCE_READWRITE, SCOPE_PRESENCE_READ), "presence-setpresence", M365Action.Support.SUPPORTED,
            List.of("sessionId", "availability", "activity"), List.of(), List.of("PresenceSetPresenceRejected")));
    }

    // ------------------------------------------------------------------
    // Planner
    // ------------------------------------------------------------------
    private void registerPlanner() {
        register(M365Action.rich("planner", "list-plans", "GET", "/users/{userId}/planner/plans", List.of("userId"),
            OData, true, true, List.of(),
            "List planner plans owned by or shared with a user.",
            List.of(SCOPE_PLANNER_READ), "planneruser-list-plans", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("planner", "get-plan", "GET", "/planner/plans/{planId}", List.of("planId"),
            ODataGet, true, false, List.of(),
            "Get a planner plan by id.",
            List.of(SCOPE_PLANNER_READ), "plannerplan-get", M365Action.Support.SUPPORTED,
            List.of("planId"), List.of("id", "title", "owner"), List.of("itemNotFound")));
        register(M365Action.rich("planner", "create-plan", "POST", "/planner/plans", List.of(),
            List.of(), true, false, List.of("Payload: {title, owner}."),
            "Create a new planner plan.",
            List.of(SCOPE_PLANNER_READWRITE), "plannerplan-post", M365Action.Support.SUPPORTED,
            List.of("title", "owner"), List.of("id", "title"), List.of("Request_BadRequest")));
        register(M365Action.rich("planner", "update-plan", "PATCH", "/planner/plans/{planId}", List.of("planId"),
            List.of(), true, false, List.of("Payload: {title}. Requires If-Match."),
            "Update a planner plan (requires If-Match header).",
            List.of(SCOPE_PLANNER_READWRITE), "plannerplan-update", M365Action.Support.SUPPORTED,
            List.of("title", "If-Match"), List.of("id"), List.of("PreconditionFailed")));
        register(M365Action.rich("planner", "delete-plan", "DELETE", "/planner/plans/{planId}", List.of("planId"),
            List.of(), true, false, List.of(),
            "Delete a planner plan.",
            List.of(SCOPE_PLANNER_READWRITE), "plannerplan-delete", M365Action.Support.SUPPORTED,
            List.of("planId"), List.of(), List.of("itemNotFound")));
        register(M365Action.rich("planner", "list-tasks", "GET", "/planner/plans/{planId}/tasks", List.of("planId"),
            OData, true, true, List.of(),
            "List tasks in a planner plan.",
            List.of(SCOPE_PLANNER_READ), "plannerplan-list-tasks", M365Action.Support.SUPPORTED,
            List.of("planId"), List.of("value[]"), List.of()));
        register(M365Action.rich("planner", "get-task", "GET", "/planner/tasks/{taskId}", List.of("taskId"),
            ODataGet, true, false, List.of(),
            "Get a planner task by id.",
            List.of(SCOPE_PLANNER_READ), "plannertask-get", M365Action.Support.SUPPORTED,
            List.of("taskId"), List.of("id", "title", "percentComplete"), List.of("itemNotFound")));
        register(M365Action.rich("planner", "create-task", "POST", "/planner/tasks", List.of(),
            List.of(), true, false, List.of("Payload: {planId, bucketId, title}."),
            "Create a new planner task.",
            List.of(SCOPE_PLANNER_READWRITE), "plannertask-post", M365Action.Support.SUPPORTED,
            List.of("planId", "bucketId", "title"), List.of("id", "title"), List.of("Request_BadRequest")));
        register(M365Action.rich("planner", "update-task", "PATCH", "/planner/tasks/{taskId}", List.of("taskId"),
            List.of(), true, false, List.of("Payload: {title}. Requires If-Match."),
            "Update a planner task (requires If-Match header).",
            List.of(SCOPE_PLANNER_READWRITE), "plannertask-update", M365Action.Support.SUPPORTED,
            List.of("title", "percentComplete", "If-Match"), List.of("id"), List.of("PreconditionFailed")));
        register(M365Action.rich("planner", "delete-task", "DELETE", "/planner/tasks/{taskId}", List.of("taskId"),
            List.of(), true, false, List.of(),
            "Delete a planner task.",
            List.of(SCOPE_PLANNER_READWRITE), "plannertask-delete", M365Action.Support.SUPPORTED,
            List.of("taskId"), List.of(), List.of("itemNotFound")));
        register(M365Action.rich("planner", "complete-task", "POST", "/planner/tasks/{taskId}/details", List.of("taskId"),
            List.of(), true, false, List.of("Payload: {checklist} or percentComplete to mark done."),
            "Mark a planner task as complete via its details.",
            List.of(SCOPE_PLANNER_READWRITE), "plannertaskdetails-update", M365Action.Support.SUPPORTED,
            List.of("percentComplete"), List.of("id"), List.of()));
    }

    // ------------------------------------------------------------------
    // To Do
    // ------------------------------------------------------------------
    private void registerToDo() {
        register(M365Action.rich("todo", "list-lists", "GET", "/users/{userId}/todo/lists", List.of("userId"),
            List.of(), true, true, List.of(),
            "List a user's To Do task lists.",
            List.of(SCOPE_TASKS_READ), "todo-tasklist-list", M365Action.Support.SUPPORTED,
            List.of("userId"), List.of("value[]"), List.of()));
        register(M365Action.rich("todo", "get-list", "GET", "/users/{userId}/todo/lists/{listId}",
            List.of("userId", "listId"), ODataGet, true, false, List.of(),
            "Get a single To Do task list.",
            List.of(SCOPE_TASKS_READ), "todoTaskList-get", M365Action.Support.SUPPORTED,
            List.of("userId", "listId"), List.of("id", "displayName"), List.of("itemNotFound")));
        register(M365Action.rich("todo", "create-list", "POST", "/users/{userId}/todo/lists", List.of("userId"),
            List.of(), true, false, List.of("Payload: {displayName}."),
            "Create a new To Do task list.",
            List.of(SCOPE_TASKS_READWRITE), "todoTaskList-post", M365Action.Support.SUPPORTED,
            List.of("displayName"), List.of("id", "displayName"), List.of()));
        register(M365Action.rich("todo", "update-list", "PATCH", "/users/{userId}/todo/lists/{listId}",
            List.of("userId", "listId"), List.of(), true, false, List.of(),
            "Update a To Do task list (rename).",
            List.of(SCOPE_TASKS_READWRITE), "todoTaskList-update", M365Action.Support.SUPPORTED,
            List.of("displayName"), List.of("id"), List.of()));
        register(M365Action.rich("todo", "delete-list", "DELETE", "/users/{userId}/todo/lists/{listId}",
            List.of("userId", "listId"), List.of(), true, false, List.of(),
            "Delete a To Do task list.",
            List.of(SCOPE_TASKS_READWRITE), "todoTaskList-delete", M365Action.Support.SUPPORTED,
            List.of("userId", "listId"), List.of(), List.of("itemNotFound")));
        register(M365Action.rich("todo", "list-tasks", "GET", "/users/{userId}/todo/lists/{listId}/tasks",
            List.of("userId", "listId"), OData, true, true, List.of(),
            "List tasks in a To Do list.",
            List.of(SCOPE_TASKS_READ), "todoTask-list", M365Action.Support.SUPPORTED,
            List.of("userId", "listId"), List.of("value[]"), List.of()));
        register(M365Action.rich("todo", "get-task", "GET", "/users/{userId}/todo/lists/{listId}/tasks/{taskId}",
            List.of("userId", "listId", "taskId"), ODataGet, true, false, List.of(),
            "Get a single To Do task.",
            List.of(SCOPE_TASKS_READ), "todoTask-get", M365Action.Support.SUPPORTED,
            List.of("userId", "listId", "taskId"), List.of("id", "title", "status"), List.of("itemNotFound")));
        register(M365Action.rich("todo", "create-task", "POST", "/users/{userId}/todo/lists/{listId}/tasks",
            List.of("userId", "listId"), List.of(), true, false, List.of("Payload: {title}."),
            "Create a new To Do task.",
            List.of(SCOPE_TASKS_READWRITE), "todoTask-post", M365Action.Support.SUPPORTED,
            List.of("title"), List.of("id", "title"), List.of()));
        register(M365Action.rich("todo", "update-task", "PATCH", "/users/{userId}/todo/lists/{listId}/tasks/{taskId}",
            List.of("userId", "listId", "taskId"), List.of(), true, false, List.of(),
            "Update a To Do task (title, dueDateTime, status).",
            List.of(SCOPE_TASKS_READWRITE), "todoTask-update", M365Action.Support.SUPPORTED,
            List.of("title", "status"), List.of("id"), List.of()));
        register(M365Action.rich("todo", "delete-task", "DELETE", "/users/{userId}/todo/lists/{listId}/tasks/{taskId}",
            List.of("userId", "listId", "taskId"), List.of(), true, false, List.of(),
            "Delete a To Do task.",
            List.of(SCOPE_TASKS_READWRITE), "todoTask-delete", M365Action.Support.SUPPORTED,
            List.of("userId", "listId", "taskId"), List.of(), List.of("itemNotFound")));
        register(M365Action.rich("todo", "complete-task", "POST", "/users/{userId}/todo/lists/{listId}/tasks/{taskId}/complete",
            List.of("userId", "listId", "taskId"), List.of(), true, false, List.of(),
            "Mark a To Do task as completed.",
            List.of(SCOPE_TASKS_READWRITE), "todoTask-complete", M365Action.Support.SUPPORTED,
            List.of("userId", "listId", "taskId"), List.of(), List.of("itemNotFound")));
    }

    // ------------------------------------------------------------------
    // Search
    // ------------------------------------------------------------------
    private void registerSearch() {
        register(M365Action.delegate("search", "mail", "search",
            "Search mail across the tenant via Microsoft Search (/search/query).",
            List.of(SCOPE_MAIL_READ, "Mail.Read.All")));
        register(M365Action.delegate("search", "files", "search",
            "Search files via Microsoft Search (/search/query).",
            List.of(SCOPE_FILES_READ, "Files.Read.All")));
        register(M365Action.delegate("search", "sites", "search",
            "Search SharePoint sites via Microsoft Search (/search/query).",
            List.of(SCOPE_SITES_READ)));
        register(M365Action.delegate("search", "users", "search",
            "Search users via Microsoft Search (/search/query).",
            List.of(SCOPE_USER_READ_ALL, SCOPE_DIRECTORY_READ_ALL)));
        register(M365Action.delegate("search", "messages", "search",
            "Search messages via Microsoft Search (/search/query).",
            List.of(SCOPE_MAIL_READ, "Mail.Read.All")));
    }

    // ------------------------------------------------------------------
    // Notification
    // ------------------------------------------------------------------
    private void registerNotification() {
        register(M365Action.rich("notification", "list", "GET", "/me/messages?$filter=isRead%20eq%20false",
            List.of(), List.of("$select", "$top"), true, true, List.of("Lists unread messages as notifications."),
            "List unread messages (notifications) in the signed-in user's mailbox.",
            List.of(SCOPE_MAIL_READ), "user-list-messages", M365Action.Support.SUPPORTED,
            List.of("$select", "$top"), List.of("value[]"), List.of()));
        register(M365Action.rich("notification", "mark-as-read", "PATCH", "/users/{userId}/messages/{messageId}",
            List.of("userId", "messageId"), List.of(), true, false, List.of("Payload: {isRead: true}."),
            "Mark a message as read.",
            List.of(SCOPE_MAIL_READWRITE), "message-update", M365Action.Support.SUPPORTED,
            List.of("isRead"), List.of("id"), List.of("ErrorItemNotFound")));
    }

    // ------------------------------------------------------------------
    // Subscription / Webhook
    // ------------------------------------------------------------------
    private void registerSubscription() {
        register(M365Action.rich("subscription", "create", "POST", "/subscriptions", List.of(),
            List.of(), true, false, List.of("Payload: {changeType, notificationUrl, resource, expirationDateTime}."),
            "Create a Graph change-notification subscription (webhook).",
            List.of(SCOPE_SUBSCRIPTION_READWRITE), "subscription-post", M365Action.Support.SUPPORTED,
            List.of("changeType", "notificationUrl", "resource", "expirationDateTime"),
            List.of("id", "expirationDateTime"), List.of("ExtensionError", "SubscriptionValidationFailed")));
        register(M365Action.rich("subscription", "get", "GET", "/subscriptions/{subscriptionId}",
            List.of("subscriptionId"), ODataGet, true, false, List.of(),
            "Get a change-notification subscription by id.",
            List.of(SCOPE_SUBSCRIPTION_READWRITE), "subscription-get", M365Action.Support.SUPPORTED,
            List.of("subscriptionId"), List.of("id", "resource", "expirationDateTime"), List.of("SubscriptionNotFound")));
        register(M365Action.rich("subscription", "list", "GET", "/subscriptions", List.of(),
            List.of(), true, true, List.of(),
            "List the application's change-notification subscriptions.",
            List.of(SCOPE_SUBSCRIPTION_READWRITE), "subscription-list", M365Action.Support.SUPPORTED,
            List.of(), List.of("value[]"), List.of()));
        register(M365Action.rich("subscription", "update", "PATCH", "/subscriptions/{subscriptionId}",
            List.of("subscriptionId"), List.of(), true, false, List.of("Payload: {expirationDateTime}."),
            "Renew/extend a subscription's expiration.",
            List.of(SCOPE_SUBSCRIPTION_READWRITE), "subscription-update", M365Action.Support.SUPPORTED,
            List.of("expirationDateTime"), List.of("id", "expirationDateTime"), List.of("SubscriptionNotFound")));
        register(M365Action.rich("subscription", "delete", "DELETE", "/subscriptions/{subscriptionId}",
            List.of("subscriptionId"), List.of(), true, false, List.of(),
            "Delete a subscription.",
            List.of(SCOPE_SUBSCRIPTION_READWRITE), "subscription-delete", M365Action.Support.SUPPORTED,
            List.of("subscriptionId"), List.of(), List.of("SubscriptionNotFound")));
        register(M365Action.rich("subscription", "renew", "POST", "/subscriptions/{subscriptionId}/reauthorize",
            List.of("subscriptionId"), List.of(), true, false, List.of("Re-authorizes a subscription before expiry."),
            "Re-authorize a subscription before expiry.",
            List.of(SCOPE_SUBSCRIPTION_READWRITE), "subscription-reauthorize", M365Action.Support.SUPPORTED,
            List.of("subscriptionId"), List.of(), List.of("SubscriptionNotFound")));
    }

    // ------------------------------------------------------------------
    // Audit / Reports
    // ------------------------------------------------------------------
    private void registerAudit() {
        register(M365Action.rich("auditreport", "get-audit-log", "GET", "/auditLogs/directoryAudits", List.of(),
            OData, true, true, List.of(),
            "Get directory (Entra ID) audit logs.",
            List.of(SCOPE_AUDIT_LOG_READ), "directoryaudit-list", M365Action.Support.SUPPORTED,
            List.of("$filter", "$top"), List.of("value[]"), List.of("Authorization_RequestDenied")));
        register(M365Action.rich("auditreport", "get-sign-in-report", "GET", "/auditLogs/signIns", List.of(),
            OData, true, true, List.of(),
            "Get sign-in logs.",
            List.of(SCOPE_AUDIT_LOG_READ, SCOPE_DIRECTORY_READ_ALL), "signin-list", M365Action.Support.SUPPORTED,
            List.of("$filter", "$top"), List.of("value[]"), List.of("Authorization_RequestDenied")));
        register(M365Action.rich("auditreport", "get-user-usage", "GET",
            "/reports/getEmailActivityUserDetail(period='{period}')", List.of("period"),
            List.of(), true, false, List.of("Returns CSV; encoded in the envelope."),
            "Get email activity usage per user (CSV report).",
            List.of(SCOPE_REPORTS_READ), "reportroot-getemailactivityuserdetail", M365Action.Support.SUPPORTED,
            List.of("period"), List.of("CSV content (encoded)"), List.of("Report_NotFound")));
        register(M365Action.rich("auditreport", "get-mail-usage", "GET",
            "/reports/getMailboxUsageDetail(period='{period}')", List.of("period"),
            List.of(), true, false, List.of("Returns CSV; encoded in the envelope."),
            "Get mailbox usage detail (CSV report).",
            List.of(SCOPE_REPORTS_READ), "reportroot-getmailboxusagedetail", M365Action.Support.SUPPORTED,
            List.of("period"), List.of("CSV (encoded)"), List.of("AuthorizationNot_NotFound")));
        register(M365Action.rich("auditreport", "get-sharepoint-usage", "GET",
            "/reports/getSharePointSiteUsageDetail(period='{period}')", List.of("period"),
            List.of(), true, false, List.of("Returns CSV; encoded in the envelope."),
            "Get SharePoint site usage detail (CSV report).",
            List.of(SCOPE_REPORTS_READ), "reportroot-getsharepointsiteusagedetail", M365Action.Support.SUPPORTED,
            List.of("period"), List.of("CSV (encoded)"), List.of("AuthorizationNot_NotFound")));
        register(M365Action.rich("auditreport", "get-teams-usage", "GET",
            "/reports/getTeamsUserActivityUserDetail(period='{period}')", List.of("period"),
            List.of(), true, false, List.of("Returns CSV; encoded in the envelope."),
            "Get Teams user activity detail (CSV).",
            List.of(SCOPE_REPORTS_READ), "reportroot-getteamsuseractivityuserdetail", M365Action.Support.SUPPORTED,
            List.of("period"), List.of("CSV (encoded)"), List.of("AuthorizationNot_")));
        register(M365Action.rich("auditreport", "get-onedrive-usage", "GET",
            "/reports/getOneDriveUsageAccountDetail(period='{period}')", List.of("period"),
            List.of(), true, false, List.of("Returns CSV; encoded in the envelope."),
            "Get OneDrive usage account detail (CSV).",
            List.of(SCOPE_REPORTS_READ), "reportroot-getonedriveusageaccountdetail", M365Action.Support.SUPPORTED,
            List.of("period"), List.of("CSV (encoded)"), List.of("AuthorizationNot_")));
    }

    // ------------------------------------------------------------------
    // Auth / token
    // ------------------------------------------------------------------
    private void registerAuth() {
        register(M365Action.delegate("auth", "get-token", "auth",
            "Acquire an app-only access token via client_credentials (no user id required).",
            List.of("User.Read.All")));
        register(M365Action.delegate("auth", "authorization-code", "auth",
            "Exchange an OAuth 2.0 authorization code for an access token (authorization_code grant).",
            List.of("User.Read.All")));
        register(M365Action.delegate("auth", "refresh-token", "auth",
            "Exchange an OAuth 2.0 refresh token for a fresh access token (refresh_token grant).",
            List.of("User.Read.All")));
        register(M365Action.delegate("auth", "device-code-start", "auth",
            "Start the OAuth 2.0 device-code flow; returns user_code and verification_uri for sign-in.",
            List.of("User.Read.All")));
        register(M365Action.delegate("auth", "device-code-poll", "auth",
            "Poll the token endpoint for a device-code flow until the user completes sign-in.",
            List.of("User.Read.All")));
        register(M365Action.delegate("auth", "on-behalf-of", "auth",
            "Exchange a caller assertion (JWT) for a downstream Graph token via the On-Behalf-Of (OBO) flow.",
            List.of("User.Read.All")));
    }

    // ------------------------------------------------------------------
    // Registry API
    // ------------------------------------------------------------------

    public M365Action require(String operation) {
        M365Action action = byOperation.get(operation);
        if (action == null) {
            throw new IllegalArgumentException(
                "Unsupported M365 operation '" + operation + "'. Expected one of: " + operationNames());
        }
        return action;
    }

    public M365Action get(String operation) {
        return byOperation.get(operation);
    }

    public List<M365Action> all() {
        return new ArrayList<>(byOperation.values());
    }

    public List<String> operationNames() {
        return new ArrayList<>(byOperation.keySet());
    }

    public boolean contains(String operation) {
        return byOperation.containsKey(operation);
    }
}
