package camel.harness.connectors.github.commit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code commit} service family: list, get, compare,
 * statuses, comments, and the {@code list-files} delegate.
 */
class CommitServiceTest extends GithubServiceTestSupport {

    @Test
    void listIsRegisteredAndPaginated() {
        GithubAction action = actions.require("commit.list");
        assertEquals("GET", action.method());
        assertEquals("/repos/{owner}/{repo}/commits", action.path());
        assertEquals(true, action.paginated());
    }

    @Test
    void listResolvesToDirectRoute() {
        assertEquals("direct:github.commit.list", resolveRoute("commit.list"));
    }

    @Test
    void getUsesRefPathParam() {
        GithubAction action = actions.require("commit.get");
        assertEquals("/repos/{owner}/{repo}/commits/{ref}", action.path());
        assertEquals(java.util.List.of("owner", "repo", "ref"), action.pathParams());
    }

    @Test
    void getResolvesToDirectRoute() {
        assertEquals("direct:github.commit.get", resolveRoute("commit.get"));
    }

    @Test
    void compareUsesBaseAndHead() {
        GithubAction action = actions.require("commit.compare");
        assertEquals("/repos/{owner}/{repo}/compare/{base}...{head}", action.path());
        assertEquals(java.util.List.of("owner", "repo", "base", "head"), action.pathParams());
    }

    @Test
    void compareResolvesToDirectRoute() {
        assertEquals("direct:github.commit.compare", resolveRoute("commit.compare"));
    }

    @Test
    void getStatusUsesRefPathParam() {
        GithubAction action = actions.require("commit.get-status");
        assertEquals("GET", action.method());
        assertEquals("/repos/{owner}/{repo}/commits/{ref}/status", action.path());
    }

    @Test
    void listStatusesIsPaginated() {
        GithubAction action = actions.require("commit.list-statuses");
        assertEquals("GET", action.method());
        assertEquals("/repos/{owner}/{repo}/commits/{ref}/statuses", action.path());
        assertEquals(true, action.paginated());
    }

    @Test
    void listFilesIsDelegated() {
        GithubAction action = actions.require("commit.list-files");
        assertEquals(true, action.hasDelegate());
        assertEquals("commit", action.delegate());
        assertEquals("direct:github.commit.list-files", action.route());
    }

    @Test
    void listFilesResolvesToDirectRoute() {
        assertEquals("direct:github.commit.list-files", resolveRoute("commit.list-files"));
    }

    @Test
    void listCommentsIsPaginated() {
        GithubAction action = actions.require("commit.list-comments");
        assertEquals("/repos/{owner}/{repo}/commits/{ref}/comments", action.path());
        assertEquals(true, action.paginated());
    }

    @Test
    void createCommentUsesPost() {
        GithubAction action = actions.require("commit.create-comment");
        assertEquals("POST", action.method());
        assertEquals("/repos/{owner}/{repo}/commits/{ref}/comments", action.path());
        assertEquals(java.util.List.of("owner", "repo", "ref"), action.pathParams());
    }

    @Test
    void commentCrudUsesCommentId() {
        GithubAction get = actions.require("commit.get-comment");
        assertEquals("/repos/{owner}/{repo}/comments/{commentId}", get.path());
        assertEquals(java.util.List.of("owner", "repo", "commentId"), get.pathParams());

        GithubAction update = actions.require("commit.update-comment");
        assertEquals("PATCH", update.method());
        assertEquals(java.util.List.of("owner", "repo", "commentId"), update.pathParams());

        GithubAction delete = actions.require("commit.delete-comment");
        assertEquals("DELETE", delete.method());
        assertEquals(java.util.List.of("owner", "repo", "commentId"), delete.pathParams());
    }

    @Test
    void commentRoutesResolve() {
        assertEquals("direct:github.commit.get-comment", resolveRoute("commit.get-comment"));
        assertEquals("direct:github.commit.update-comment", resolveRoute("commit.update-comment"));
        assertEquals("direct:github.commit.delete-comment", resolveRoute("commit.delete-comment"));
        assertEquals("direct:github.commit.create-comment", resolveRoute("commit.create-comment"));
        assertEquals("direct:github.commit.list-comments", resolveRoute("commit.list-comments"));
        assertTrue(actions.require("commit.list-comments").paginated());
    }
}
