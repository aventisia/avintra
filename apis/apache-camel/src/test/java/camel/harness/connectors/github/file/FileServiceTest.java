package camel.harness.connectors.github.file;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code file} service family: get, list, create,
 * update, delete (GitHub contents API).
 */
class FileServiceTest extends GithubServiceTestSupport {

    @Test
    void getIsRegisteredWithPathParam() {
        GithubAction action = actions.require("file.get");
        assertEquals("GET", action.method());
        assertEquals("/repos/{owner}/{repo}/contents/{path}", action.path());
        assertEquals(java.util.List.of("owner", "repo", "path"), action.pathParams());
    }

    @Test
    void getResolvesToDirectRoute() {
        assertEquals("direct:github.file.get", resolveRoute("file.get"));
    }

    @Test
    void createUsesPutOnContents() {
        GithubAction action = actions.require("file.create");
        assertEquals("PUT", action.method());
        assertEquals("/repos/{owner}/{repo}/contents/{path}", action.path());
    }

    @Test
    void updateSharesPutEndpointWithCreate() {
        GithubAction action = actions.require("file.update");
        assertEquals("PUT", action.method());
        assertEquals("/repos/{owner}/{repo}/contents/{path}", action.path());
    }

    @Test
    void deleteIsDelegate() {
        GithubAction action = actions.require("file.delete");
        assertEquals(true, action.hasDelegate());
        assertEquals("file", action.delegate());
        assertEquals("direct:github.file.delete", action.route());
    }
}
