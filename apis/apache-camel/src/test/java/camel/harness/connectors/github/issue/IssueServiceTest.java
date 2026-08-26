package camel.harness.connectors.github.issue;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code issue} service family: create, update, delete,
 * close, reopen, lock/unlock, and the {@code issue.label} + {@code issue.comment}
 * sub-services.
 */
class IssueServiceTest extends GithubServiceTestSupport {

    @Test
    void createIsRegisteredAsPost() {
        GithubAction action = actions.require("issue.create");
        assertEquals("POST", action.method());
        assertEquals("/repos/{owner}/{repo}/issues", action.path());
    }

    @Test
    void createResolvesToDirectRoute() {
        assertEquals("direct:github.issue.create", resolveRoute("issue.create"));
    }

    @Test
    void closeUsesPatch() {
        GithubAction action = actions.require("issue.close");
        assertEquals("PATCH", action.method());
        assertEquals("/repos/{owner}/{repo}/issues/{number}", action.path());
    }

    @Test
    void deleteIsRegisteredAsDelete() {
        GithubAction action = actions.require("issue.delete");
        assertEquals("DELETE", action.method());
        assertEquals("/repos/{owner}/{repo}/issues/{number}", action.path());
        assertEquals(java.util.List.of("owner", "repo", "number"), action.pathParams());
    }

    @Test
    void deleteResolvesToDirectRoute() {
        assertEquals("direct:github.issue.delete", resolveRoute("issue.delete"));
    }

    @Test
    void lockUsesPutAndUnlockUsesDelete() {
        GithubAction lock = actions.require("issue.lock");
        assertEquals("PUT", lock.method());
        assertEquals("/repos/{owner}/{repo}/issues/{number}/lock", lock.path());

        GithubAction unlock = actions.require("issue.unlock");
        assertEquals("DELETE", unlock.method());
        assertEquals("/repos/{owner}/{repo}/issues/{number}/lock", unlock.path());
    }

    @Test
    void labelAddIsRegisteredUnderIssueLabelService() {
        GithubAction action = actions.require("issue.label.add");
        assertEquals("issue.label", action.service());
        assertEquals("add", action.action());
        assertEquals("issue.label.add", action.operation());
    }

    @Test
    void labelRemoveRequiresLabelName() {
        GithubAction action = actions.require("issue.label.remove");
        assertEquals(java.util.List.of("owner", "repo", "number", "name"), action.pathParams());
    }

    @Test
    void labelCrudIsRegistered() {
        GithubAction list = actions.require("issue.label.list");
        assertEquals("GET", list.method());
        assertEquals("/repos/{owner}/{repo}/labels", list.path());
        assertTrue(list.paginated());

        GithubAction get = actions.require("issue.label.get");
        assertEquals("/repos/{owner}/{repo}/labels/{name}", get.path());

        GithubAction create = actions.require("issue.label.create");
        assertEquals("POST", create.method());
        assertEquals("/repos/{owner}/{repo}/labels", create.path());

        GithubAction update = actions.require("issue.label.update");
        assertEquals("PATCH", update.method());
        assertEquals("/repos/{owner}/{repo}/labels/{name}", update.path());

        GithubAction delete = actions.require("issue.label.delete");
        assertEquals("DELETE", delete.method());
        assertEquals("/repos/{owner}/{repo}/labels/{name}", delete.path());
    }

    @Test
    void labelSetAndListOnIssueAreRegistered() {
        GithubAction set = actions.require("issue.label.set");
        assertEquals("PUT", set.method());
        assertEquals("/repos/{owner}/{repo}/issues/{number}/labels", set.path());

        GithubAction listOnIssue = actions.require("issue.label.list-on-issue");
        assertEquals("GET", listOnIssue.method());
        assertEquals("/repos/{owner}/{repo}/issues/{number}/labels", listOnIssue.path());
        assertTrue(listOnIssue.paginated());
    }

    @Test
    void commentCrudIsRegistered() {
        GithubAction add = actions.require("issue.comment.add");
        assertEquals("POST", add.method());
        assertEquals("/repos/{owner}/{repo}/issues/{number}/comments", add.path());

        GithubAction list = actions.require("issue.comment.list");
        assertEquals("GET", list.method());
        assertEquals("/repos/{owner}/{repo}/issues/{number}/comments", list.path());
        assertTrue(list.paginated());

        GithubAction get = actions.require("issue.comment.get");
        assertEquals("/repos/{owner}/{repo}/issues/comments/{commentId}", get.path());
        assertEquals(java.util.List.of("owner", "repo", "commentId"), get.pathParams());

        GithubAction update = actions.require("issue.comment.update");
        assertEquals("PATCH", update.method());
        assertEquals("/repos/{owner}/{repo}/issues/comments/{commentId}", update.path());

        GithubAction delete = actions.require("issue.comment.delete");
        assertEquals("DELETE", delete.method());
        assertEquals("/repos/{owner}/{repo}/issues/comments/{commentId}", delete.path());
    }

    @Test
    void issueSubServiceRoutesResolve() {
        assertEquals("direct:github.issue.lock", resolveRoute("issue.lock"));
        assertEquals("direct:github.issue.unlock", resolveRoute("issue.unlock"));
        assertEquals("direct:github.issue.label.create", resolveRoute("issue.label.create"));
        assertEquals("direct:github.issue.label.update", resolveRoute("issue.label.update"));
        assertEquals("direct:github.issue.label.delete", resolveRoute("issue.label.delete"));
        assertEquals("direct:github.issue.label.set", resolveRoute("issue.label.set"));
        assertEquals("direct:github.issue.label.list", resolveRoute("issue.label.list"));
        assertEquals("direct:github.issue.label.get", resolveRoute("issue.label.get"));
        assertEquals("direct:github.issue.label.list-on-issue", resolveRoute("issue.label.list-on-issue"));
        assertEquals("direct:github.issue.comment.list", resolveRoute("issue.comment.list"));
        assertEquals("direct:github.issue.comment.get", resolveRoute("issue.comment.get"));
        assertEquals("direct:github.issue.comment.update", resolveRoute("issue.comment.update"));
        assertEquals("direct:github.issue.comment.delete", resolveRoute("issue.comment.delete"));
    }
}
