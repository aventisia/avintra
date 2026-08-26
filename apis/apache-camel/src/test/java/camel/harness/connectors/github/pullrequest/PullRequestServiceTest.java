package camel.harness.connectors.github.pullrequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code pullrequest} service family: list, get, create,
 * update, close, reopen, merge, and the {@code pullrequest.review} sub-service.
 */
class PullRequestServiceTest extends GithubServiceTestSupport {

    @Test
    void createIsRegisteredWithoutHyphens() {
        GithubAction action = actions.require("pullrequest.create");
        assertEquals("pullrequest", action.service());
        assertEquals("create", action.action());
        assertEquals("pullrequest.create", action.operation());
    }

    @Test
    void createResolvesToDirectRoute() {
        assertEquals("direct:github.pullrequest.create", resolveRoute("pullrequest.create"));
        assertEquals("direct:github.pullrequest.create", actions.require("pullrequest.create").route());
    }

    @Test
    void createUsesPostToPullsPath() {
        GithubAction action = actions.require("pullrequest.create");
        assertEquals("POST", action.method());
        assertEquals("/repos/{owner}/{repo}/pulls", action.path());
        assertEquals(java.util.List.of("owner", "repo"), action.pathParams());
    }

    @Test
    void mergeIsRegistered() {
        GithubAction action = actions.require("pullrequest.merge");
        assertEquals("pullrequest.merge", action.operation());
    }

    @Test
    void mergeResolvesToDirectRoute() {
        assertEquals("direct:github.pullrequest.merge", resolveRoute("pullrequest.merge"));
    }

    @Test
    void mergeUsesPutOnMergePathWithNumberParam() {
        GithubAction action = actions.require("pullrequest.merge");
        assertEquals("PUT", action.method());
        assertEquals("/repos/{owner}/{repo}/pulls/{number}/merge", action.path());
        assertEquals(java.util.List.of("owner", "repo", "number"), action.pathParams());
    }
}
