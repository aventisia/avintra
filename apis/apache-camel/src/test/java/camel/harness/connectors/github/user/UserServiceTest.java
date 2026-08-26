package camel.harness.connectors.github.user;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code user} service family: get-current, get-user.
 */
class UserServiceTest extends GithubServiceTestSupport {

    @Test
    void getCurrentIsRegisteredAndRequiresAuth() {
        GithubAction action = actions.require("user.get-current");
        assertEquals("GET", action.method());
        assertEquals("/user", action.path());
        assertEquals(true, action.authRequired());
    }

    @Test
    void getCurrentResolvesToDirectRoute() {
        assertEquals("direct:github.user.get-current", resolveRoute("user.get-current"));
    }

    @Test
    void getUserUsesUsernameParam() {
        GithubAction action = actions.require("user.get-user");
        assertEquals("/users/{username}", action.path());
        assertEquals(java.util.List.of("username"), action.pathParams());
    }

    @Test
    void getUserResolvesToDirectRoute() {
        assertEquals("direct:github.user.get-user", resolveRoute("user.get-user"));
    }

    @Test
    void listRepositoriesUsesUsernameAndIsPaginated() {
        GithubAction action = actions.require("user.list-repositories");
        assertEquals("/users/{username}/repos", action.path());
        assertEquals(java.util.List.of("username"), action.pathParams());
        assertEquals(true, action.paginated());
    }

    @Test
    void listFollowersAndFollowingArePaginated() {
        GithubAction followers = actions.require("user.list-followers");
        assertEquals("/users/{username}/followers", followers.path());
        assertEquals(true, followers.paginated());

        GithubAction following = actions.require("user.list-following");
        assertEquals("/users/{username}/following", following.path());
        assertEquals(true, following.paginated());
    }

    @Test
    void userListRoutesResolve() {
        assertEquals("direct:github.user.list-repositories", resolveRoute("user.list-repositories"));
        assertEquals("direct:github.user.list-followers", resolveRoute("user.list-followers"));
        assertEquals("direct:github.user.list-following", resolveRoute("user.list-following"));
    }
}
