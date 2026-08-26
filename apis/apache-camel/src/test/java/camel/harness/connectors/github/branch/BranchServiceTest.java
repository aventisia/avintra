package camel.harness.connectors.github.branch;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code branch} service family: create, merge, delete.
 */
class BranchServiceTest extends GithubServiceTestSupport {

    @Test
    void createIsRegisteredAsPost() {
        GithubAction action = actions.require("branch.create");
        assertEquals("POST", action.method());
        assertEquals("/repos/{owner}/{repo}/git/refs", action.path());
        assertEquals(java.util.List.of("owner", "repo"), action.pathParams());
    }

    @Test
    void createResolvesToDirectRoute() {
        assertEquals("direct:github.branch.create", resolveRoute("branch.create"));
    }

    @Test
    void mergeIsRegisteredAsPost() {
        GithubAction action = actions.require("branch.merge");
        assertEquals("POST", action.method());
        assertEquals("/repos/{owner}/{repo}/merges", action.path());
    }

    @Test
    void deleteRequiresBranchParam() {
        GithubAction action = actions.require("branch.delete");
        assertEquals("DELETE", action.method());
        assertEquals("/repos/{owner}/{repo}/git/refs/heads/{branch}", action.path());
        assertEquals(java.util.List.of("owner", "repo", "branch"), action.pathParams());
    }

    @Test
    void deleteResolvesToDirectRoute() {
        assertEquals("direct:github.branch.delete", resolveRoute("branch.delete"));
    }
}
