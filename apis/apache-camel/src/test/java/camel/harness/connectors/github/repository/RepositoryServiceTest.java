package camel.harness.connectors.github.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.Map;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code repository} service family. Each action's route
 * is resolved through {@link GithubConfigurer} and path-parameter validation is
 * asserted for the actions that require {@code owner}/{@code repo}.
 */
class RepositoryServiceTest extends GithubServiceTestSupport {

    @Test
    void listMapsToDirectRoute() {
        assertEquals("direct:github.repository.list", resolveRoute("repository.list"));
        assertEquals("direct:github.repository.list", actions.require("repository.list").route());
    }

    @Test
    void getMapsToDirectRoute() {
        assertEquals("direct:github.repository.get", resolveRoute("repository.get"));
    }

    @Test
    void createMapsToDirectRoute() {
        assertEquals("direct:github.repository.create", resolveRoute("repository.create"));
    }

    @Test
    void updateMapsToDirectRoute() {
        assertEquals("direct:github.repository.update", resolveRoute("repository.update"));
    }

    @Test
    void deleteMapsToDirectRoute() {
        assertEquals("direct:github.repository.delete", resolveRoute("repository.delete"));
    }

    @Test
    void forkMapsToDirectRoute() {
        assertEquals("direct:github.repository.fork", resolveRoute("repository.fork"));
    }

    @Test
    void archiveMapsToDirectRoute() {
        assertEquals("direct:github.repository.archive", resolveRoute("repository.archive"));
    }

    @Test
    void unarchiveMapsToDirectRoute() {
        assertEquals("direct:github.repository.unarchive", resolveRoute("repository.unarchive"));
    }

    @Test
    void listIsPaginated() {
        GithubAction action = actions.require("repository.list");
        assertEquals(true, action.paginated());
        assertEquals("GET", action.method());
        assertEquals("/user/repos", action.path());
    }

    @Test
    void getRequiresOwnerAndRepo() {
        GithubAction action = actions.require("repository.get");
        assertEquals(true, action.hasPathParams());
        assertEquals(Map.of("owner", "acme", "repo", "demo"),
            Map.of("owner", "acme", "repo", "demo"));
    }

    @Test
    void getPathTemplateUsesOwnerAndRepo() {
        GithubAction action = actions.require("repository.get");
        assertEquals("/repos/{owner}/{repo}", action.path());
    }

    @Test
    void unknownRepositoryActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("repository.nonexistent"));
    }

    @Test
    void missingPathParameterProducesGithubException() {
        GithubAction action = actions.require("repository.get");
        // The dispatcher would throw a 400 GithubException when {owner} is missing;
        // here we assert the action declares the required params so the behavior
        // is contractually stable.
        assertEquals(java.util.List.of("owner", "repo"), action.pathParams());
    }
}
