package camel.harness.connectors.github.search;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code search} service family: repositories, code,
 * issues, users.
 */
class SearchServiceTest extends GithubServiceTestSupport {

    @Test
    void repositoriesIsRegisteredAndPaginated() {
        GithubAction action = actions.require("search.repositories");
        assertEquals("GET", action.method());
        assertEquals("/search/repositories", action.path());
        assertTrue(action.paginated());
        assertTrue(action.queryParams().contains("q"));
    }

    @Test
    void repositoriesResolvesToDirectRoute() {
        assertEquals("direct:github.search.repositories", resolveRoute("search.repositories"));
    }

    @Test
    void codeRequiresAuthentication() {
        assertTrue(actions.require("search.code").authRequired());
    }

    @Test
    void usersResolvesToDirectRoute() {
        assertEquals("direct:github.search.users", resolveRoute("search.users"));
    }
}
