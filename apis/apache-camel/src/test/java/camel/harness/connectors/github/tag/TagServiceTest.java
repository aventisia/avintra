package camel.harness.connectors.github.tag;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code tag} service family: list, get, create.
 */
class TagServiceTest extends GithubServiceTestSupport {

    @Test
    void listIsRegisteredAndPaginated() {
        GithubAction action = actions.require("tag.list");
        assertEquals("GET", action.method());
        assertEquals("/repos/{owner}/{repo}/tags", action.path());
        assertEquals(true, action.paginated());
    }

    @Test
    void listResolvesToDirectRoute() {
        assertEquals("direct:github.tag.list", resolveRoute("tag.list"));
    }

    @Test
    void getUsesRefPath() {
        GithubAction action = actions.require("tag.get");
        assertEquals("/repos/{owner}/{repo}/git/ref/tags/{tag}", action.path());
        assertEquals(java.util.List.of("owner", "repo", "tag"), action.pathParams());
    }

    @Test
    void createUsesPostOnRefs() {
        GithubAction action = actions.require("tag.create");
        assertEquals("POST", action.method());
        assertEquals("/repos/{owner}/{repo}/git/refs", action.path());
    }

    @Test
    void deleteUsesDeleteOnRefsTags() {
        GithubAction action = actions.require("tag.delete");
        assertEquals("DELETE", action.method());
        assertEquals("/repos/{owner}/{repo}/git/refs/tags/{tag}", action.path());
        assertEquals(java.util.List.of("owner", "repo", "tag"), action.pathParams());
    }

    @Test
    void deleteResolvesToDirectRoute() {
        assertEquals("direct:github.tag.delete", resolveRoute("tag.delete"));
    }
}
