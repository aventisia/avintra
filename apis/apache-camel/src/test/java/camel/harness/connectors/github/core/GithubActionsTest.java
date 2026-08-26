package camel.harness.connectors.github.core;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubActions;
import camel.harness.core.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class GithubActionsTest {

    private final GithubActions actions = new GithubActions();

    @Test
    void registersAllServiceFamilies() {
        assertTrue(actions.contains("repository.create"));
        assertTrue(actions.contains("branch.merge"));
        assertTrue(actions.contains("commit.get"));
        assertTrue(actions.contains("commit.compare"));
        assertTrue(actions.contains("commit.list-files"));
        assertTrue(actions.contains("commit.create-comment"));
        assertTrue(actions.contains("file.delete"));
        assertTrue(actions.contains("pullrequest.merge"));
        assertTrue(actions.contains("pullrequest.review.submit-review"));
        assertTrue(actions.contains("pullrequest.review.get"));
        assertTrue(actions.contains("pullrequest.review.dismiss"));
        assertTrue(actions.contains("issue.label.add"));
        assertTrue(actions.contains("issue.delete"));
        assertTrue(actions.contains("issue.lock"));
        assertTrue(actions.contains("issue.comment.add"));
        assertTrue(actions.contains("issue.comment.delete"));
        assertTrue(actions.contains("issue.label.set"));
        assertTrue(actions.contains("release.asset.upload"));
        assertTrue(actions.contains("tag.create"));
        assertTrue(actions.contains("tag.delete"));
        assertTrue(actions.contains("workflow.trigger"));
        assertTrue(actions.contains("workflow.run.rerun"));
        assertTrue(actions.contains("workflow.run.list-jobs"));
        assertTrue(actions.contains("organization.list-members"));
        assertTrue(actions.contains("user.get-current"));
        assertTrue(actions.contains("webhook.create"));
        assertTrue(actions.contains("webhook.ping"));
        assertTrue(actions.contains("webhook.event.verify"));
        assertTrue(actions.contains("search.code"));
        assertTrue(actions.contains("notification.mark-read"));
    }

    @Test
    void routesUseDirectPattern() {
        GithubAction action = actions.require("repository.create");
        assertEquals("direct:github.repository.create", action.route());
        assertEquals("repository.create", action.operation());
    }

    @Test
    void unknownOperationThrows() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> actions.require("does.not.exist"));
        assertTrue(ex.getMessage().contains("does.not.exist"));
    }

    @Test
    void paginatedActionsAreFlagged() {
        assertTrue(actions.require("repository.list").paginated());
        assertTrue(actions.require("branch.list").paginated());
        assertTrue(actions.require("notification.list").paginated());
        assertTrue(!actions.require("repository.get").paginated());
    }

    @Test
    void localActionsDoNotHitRest() {
        GithubAction verify = actions.require("webhook.event.verify");
        assertTrue(verify.localOnly());
    }

    @Test
    void allActionsExposeDirectRoutes() {
        for (GithubAction action : actions.all()) {
            assertNotNull(action.route());
            assertTrue(action.route().startsWith("direct:github."), "Unexpected route " + action.route());
        }
    }
}
