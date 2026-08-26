package camel.harness.connectors.github;

import camel.harness.core.*;
import java.util.List;
import java.util.Set;

/**
 * Descriptor for a single GitHub API action exposed as a
 * {@code direct:github.<service>.<action>} Camel route.
 *
 * <p>This is the modular extension point of the GitHub connector: adding a new
 * action is a one-liner in {@link GithubActions} (plus optionally wiring it in
 * the connector metadata). All routes, validation, dispatch, and schema are
 * derived from these descriptors.</p>
 *
 * @param service   service family, e.g. {@code "repository"} or {@code "pullrequest"}
 * @param action    action within the service, e.g. {@code "create"} or {@code "list"}
 * @param method    HTTP method used against the GitHub REST API
 * @param path      path template relative to the base URL, e.g. {@code /repos/{owner}/{repo}}
 * @param pathParams required path parameters (subset of {@code {name}} placeholders in {@code path})
 * @param queryParams optional query parameters accepted by the action
 * @param authRequired whether the action requires an authenticated caller
 * @param paginated whether the response is a paged list (enables pagination aggregation)
 * @param localOnly  whether the action is handled locally without an HTTP round trip
 * @param delegate   optional bean name of a domain service method for complex multi-step
 *                   operations (e.g. {@code file.delete} resolves the current file SHA
 *                   before deleting). When set, the dispatcher delegates to the service
 *                   instead of making a single REST call.
 * @param notes     human-readable notes for schema/docs generation
 */
public record GithubAction(
        String service,
        String action,
        String method,
        String path,
        List<String> pathParams,
        List<String> queryParams,
        boolean authRequired,
        boolean paginated,
        boolean localOnly,
        String delegate,
        List<String> notes) {

    /** Camel route id, e.g. {@code direct:github.repository.create}. */
    public String route() {
        return "direct:github." + service + "." + action;
    }

    /** Dotted operation name used by the request envelope, e.g. {@code repository.create}. */
    public String operation() {
        return service + "." + action;
    }

    public boolean hasPathParams() {
        return pathParams != null && !pathParams.isEmpty();
    }

    public boolean hasDelegate() {
        return delegate != null && !delegate.isBlank();
    }

    public static GithubAction of(String service, String action, String method, String path) {
        return new GithubAction(service, action, method, path, List.of(), List.of(), true, false, false, null, List.of());
    }

    public static GithubAction of(String service, String action, String method, String path,
            List<String> pathParams) {
        return new GithubAction(service, action, method, path, pathParams, List.of(), true, false, false, null, List.of());
    }

    public static GithubAction of(String service, String action, String method, String path,
            List<String> pathParams, List<String> queryParams) {
        return new GithubAction(service, action, method, path, pathParams, queryParams, true, false, false, null, List.of());
    }

    public static GithubAction of(String service, String action, String method, String path,
            List<String> pathParams, List<String> queryParams, boolean authRequired, boolean paginated,
            List<String> notes) {
        return new GithubAction(service, action, method, path, pathParams, queryParams,
            authRequired, paginated, false, null, notes);
    }

    public static GithubAction local(String service, String action) {
        return new GithubAction(service, action, "POST", "", List.of(), List.of(), false, false, true, null, List.of());
    }

    public static GithubAction delegate(String service, String action, String delegate) {
        return new GithubAction(service, action, "POST", "", List.of(), List.of(), true, false, false, delegate, List.of());
    }
}
