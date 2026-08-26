package camel.harness.connectors.github.organization;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code organization} service family: get,
 * list-repositories, list-members.
 */
class OrganizationServiceTest extends GithubServiceTestSupport {

    @Test
    void getUsesOrgPathParam() {
        GithubAction action = actions.require("organization.get");
        assertEquals("GET", action.method());
        assertEquals("/orgs/{org}", action.path());
        assertEquals(java.util.List.of("org"), action.pathParams());
    }

    @Test
    void getResolvesToDirectRoute() {
        assertEquals("direct:github.organization.get", resolveRoute("organization.get"));
    }

    @Test
    void listRepositoriesIsPaginated() {
        GithubAction action = actions.require("organization.list-repositories");
        assertEquals("/orgs/{org}/repos", action.path());
        assertEquals(true, action.paginated());
    }

    @Test
    void listMembersIsPaginated() {
        GithubAction action = actions.require("organization.list-members");
        assertEquals("/orgs/{org}/members", action.path());
        assertEquals(true, action.paginated());
    }

    @Test
    void updateUsesPatch() {
        GithubAction action = actions.require("organization.update");
        assertEquals("PATCH", action.method());
        assertEquals("/orgs/{org}", action.path());
        assertEquals(java.util.List.of("org"), action.pathParams());
    }

    @Test
    void getMemberUsesUsername() {
        GithubAction action = actions.require("organization.get-member");
        assertEquals("GET", action.method());
        assertEquals("/orgs/{org}/members/{username}", action.path());
        assertEquals(java.util.List.of("org", "username"), action.pathParams());
    }

    @Test
    void listTeamsIsPaginated() {
        GithubAction action = actions.require("organization.list-teams");
        assertEquals("/orgs/{org}/teams", action.path());
        assertEquals(true, action.paginated());
    }

    @Test
    void organizationRoutesResolve() {
        assertEquals("direct:github.organization.update", resolveRoute("organization.update"));
        assertEquals("direct:github.organization.get-member", resolveRoute("organization.get-member"));
        assertEquals("direct:github.organization.list-teams", resolveRoute("organization.list-teams"));
    }
}
