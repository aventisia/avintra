package camel.harness.connectors.github;

import camel.harness.core.*;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;

/**
 * Central registry of every GitHub action exposed by the harness. Each entry
 * declares the service family, action name, HTTP method, REST path template,
 * required path parameters, accepted query parameters, pagination and auth
 * requirements. Routes, dispatch, validation, schema, and tests are all
 * derived from this single source of truth.
 */
@Component
public class GithubActions {

    private final Map<String, GithubAction> byOperation = new LinkedHashMap<>();

    public GithubActions() {
        registerAll();
    }

    private void register(GithubAction action) {
        byOperation.put(action.operation(), action);
    }

    private void registerAll() {
        // ---- Repository -----------------------------------------------------
        register(GithubAction.of("repository", "list", "GET", "/user/repos",
            List.of(), List.of("visibility", "affiliation", "type", "sort", "direction"), true, true, List.of(
                "Lists repositories for the authenticated user. Use payload/query: visibility, affiliation, sort.")));
        register(GithubAction.of("repository", "get", "GET", "/repos/{owner}/{repo}",
            List.of("owner", "repo"), List.of(), false, false, List.of()));
        register(GithubAction.of("repository", "create", "POST", "/user/repos",
            List.of(), List.of(), true, false, List.of("Payload: {name, description, private, auto_init, ...}.")));
        register(GithubAction.of("repository", "update", "PATCH", "/repos/{owner}/{repo}",
            List.of("owner", "repo"), List.of(), false, false, List.of()));
        register(GithubAction.of("repository", "delete", "DELETE", "/repos/{owner}/{repo}",
            List.of("owner", "repo"), List.of(), false, false, List.of()));
        register(GithubAction.of("repository", "fork", "POST", "/repos/{owner}/{repo}/forks",
            List.of("owner", "repo"), List.of(), false, false, List.of("Payload may set organization, default_branch_only.")));
        register(GithubAction.of("repository", "archive", "PATCH", "/repos/{owner}/{repo}",
            List.of("owner", "repo"), List.of(), false, false, List.of("Sets archived=true. Payload may include visibility.")));
        register(GithubAction.of("repository", "unarchive", "PATCH", "/repos/{owner}/{repo}",
            List.of("owner", "repo"), List.of(), false, false, List.of("Sets archived=false.")));

        // ---- Branch ---------------------------------------------------------
        register(GithubAction.of("branch", "list", "GET", "/repos/{owner}/{repo}/branches",
            List.of("owner", "repo"), List.of("per_page", "page", "protected"), false, true, List.of()));
        register(GithubAction.of("branch", "get", "GET", "/repos/{owner}/{repo}/branches/{branch}",
            List.of("owner", "repo", "branch"), List.of(), false, false, List.of()));
        register(GithubAction.of("branch", "create", "POST", "/repos/{owner}/{repo}/git/refs",
            List.of("owner", "repo"), List.of(), false, false, List.of("Payload {ref: refs/heads/..., sha}.")));
        register(GithubAction.of("branch", "delete", "DELETE", "/repos/{owner}/{repo}/git/refs/heads/{branch}",
            List.of("owner", "repo", "branch"), List.of(), false, false, List.of()));
        register(GithubAction.of("branch", "merge", "POST", "/repos/{owner}/{repo}/merges",
            List.of("owner", "repo"), List.of(), false, false, List.of("Payload {base, head, commit_message}.")));

        // ---- Commit ---------------------------------------------------------
        register(GithubAction.of("commit", "list", "GET", "/repos/{owner}/{repo}/commits",
            List.of("owner", "repo"), List.of("sha", "path", "author", "since", "until",
                "per_page", "page"), false, true, List.of()));
        register(GithubAction.of("commit", "get", "GET", "/repos/{owner}/{repo}/commits/{ref}",
            List.of("owner", "repo", "ref"), List.of(), false, false, List.of()));
        register(GithubAction.of("commit", "compare", "GET", "/repos/{owner}/{repo}/compare/{base}...{head}",
            List.of("owner", "repo", "base", "head"), List.of("per_page", "page"), false, false, List.of(
                "Compares two commits. base and head may be branch names, SHAs, or refs (e.g. main...feature).")));
        register(GithubAction.of("commit", "get-status", "GET", "/repos/{owner}/{repo}/commits/{ref}/status",
            List.of("owner", "repo", "ref"), List.of("per_page", "page"), false, false, List.of(
                "Returns the combined commit status for a reference.")));
        register(GithubAction.of("commit", "list-statuses", "GET", "/repos/{owner}/{repo}/commits/{ref}/statuses",
            List.of("owner", "repo", "ref"), List.of("per_page", "page"), false, true, List.of()));
        // commit.list-files is delegated to GithubCommitService, which fetches
        // the commit via GET /commits/{ref} and extracts the files array.
        register(GithubAction.delegate("commit", "list-files", "commit"));
        register(GithubAction.of("commit", "list-comments", "GET", "/repos/{owner}/{repo}/commits/{ref}/comments",
            List.of("owner", "repo", "ref"), List.of("per_page", "page"), false, true, List.of()));
        register(GithubAction.of("commit", "create-comment", "POST", "/repos/{owner}/{repo}/commits/{ref}/comments",
            List.of("owner", "repo", "ref"), List.of(), false, false, List.of(
                "Payload {body, path, line, position}.")));
        register(GithubAction.of("commit", "get-comment", "GET", "/repos/{owner}/{repo}/comments/{commentId}",
            List.of("owner", "repo", "commentId"), List.of(), false, false, List.of()));
        register(GithubAction.of("commit", "update-comment", "PATCH", "/repos/{owner}/{repo}/comments/{commentId}",
            List.of("owner", "repo", "commentId"), List.of(), false, false, List.of("Payload {body}.")));
        register(GithubAction.of("commit", "delete-comment", "DELETE", "/repos/{owner}/{repo}/comments/{commentId}",
            List.of("owner", "repo", "commentId"), List.of(), false, false, List.of()));

        // ---- File -----------------------------------------------------------
        register(GithubAction.of("file", "get", "GET", "/repos/{owner}/{repo}/contents/{path}",
            List.of("owner", "repo", "path"), List.of("ref"), false, false, List.of("path is the file or directory path.")));
        register(GithubAction.of("file", "list", "GET", "/repos/{owner}/{repo}/contents/{path}",
            List.of("owner", "repo", "path"), List.of("ref"), false, false, List.of("Lists a directory; same endpoint as get.")));
        register(GithubAction.of("file", "create", "PUT", "/repos/{owner}/{repo}/contents/{path}",
            List.of("owner", "repo", "path"), List.of(), false, false, List.of("Payload {message, content (base64), branch}.")));
        register(GithubAction.of("file", "update", "PUT", "/repos/{owner}/{repo}/contents/{path}",
            List.of("owner", "repo", "path"), List.of(), false, false, List.of("Payload {message, content (base64), sha, branch}.")));
        // file.delete is delegated to GithubFileService, which fetches the file's
        // current SHA via the contents API before sending the DELETE so callers do
        // not need to supply a (frequently stale) sha.
        register(GithubAction.delegate("file", "delete", "file"));

        // ---- Pull Request ---------------------------------------------------
        register(GithubAction.of("pullrequest", "list", "GET", "/repos/{owner}/{repo}/pulls",
            List.of("owner", "repo"), List.of("state", "head", "base", "sort", "direction", "per_page", "page"), false, true, List.of()));
        register(GithubAction.of("pullrequest", "get", "GET", "/repos/{owner}/{repo}/pulls/{number}",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of()));
        register(GithubAction.of("pullrequest", "create", "POST", "/repos/{owner}/{repo}/pulls",
            List.of("owner", "repo"), List.of(), false, false, List.of("Payload {title, head, base, body, draft}.")));
        register(GithubAction.of("pullrequest", "update", "PATCH", "/repos/{owner}/{repo}/pulls/{number}",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of()));
        register(GithubAction.of("pullrequest", "close", "PATCH", "/repos/{owner}/{repo}/pulls/{number}",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of("Sets state=closed. Payload may include title/body.")));
        register(GithubAction.of("pullrequest", "reopen", "PATCH", "/repos/{owner}/{repo}/pulls/{number}",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of("Sets state=open.")));
        register(GithubAction.of("pullrequest", "merge", "PUT", "/repos/{owner}/{repo}/pulls/{number}/merge",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of("Payload {commit_title, merge_method}.")));

        // ---- Pull Request Review --------------------------------------------
        register(GithubAction.of("pullrequest.review", "add-reviewer", "POST",
            "/repos/{owner}/{repo}/pulls/{number}/requested_reviewers",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of("Payload {reviewers: [...]}.")));
        register(GithubAction.of("pullrequest.review", "remove-reviewer", "DELETE",
            "/repos/{owner}/{repo}/pulls/{number}/requested_reviewers",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of("Payload {reviewers: [...]}.")));
        register(GithubAction.of("pullrequest.review", "list-reviews", "GET",
            "/repos/{owner}/{repo}/pulls/{number}/reviews",
            List.of("owner", "repo", "number"), List.of("per_page", "page"), false, true, List.of()));
        register(GithubAction.of("pullrequest.review", "get", "GET",
            "/repos/{owner}/{repo}/pulls/{number}/reviews/{reviewId}",
            List.of("owner", "repo", "number", "reviewId"), List.of(), false, false, List.of()));
        register(GithubAction.of("pullrequest.review", "submit-review", "POST",
            "/repos/{owner}/{repo}/pulls/{number}/reviews",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of(
                "Payload {body, event (APPROVE/REQUEST_CHANGES/COMMENT), comments}.")));
        register(GithubAction.of("pullrequest.review", "create-comment", "POST",
            "/repos/{owner}/{repo}/pulls/{number}/reviews/{reviewId}/comments",
            List.of("owner", "repo", "number", "reviewId"), List.of(), false, false, List.of(
                "Payload {body, path, line, side}.")));
        register(GithubAction.of("pullrequest.review", "update", "PUT",
            "/repos/{owner}/{repo}/pulls/{number}/reviews/{reviewId}",
            List.of("owner", "repo", "number", "reviewId"), List.of(), false, false, List.of(
                "Payload {body}.")));
        register(GithubAction.of("pullrequest.review", "dismiss", "PUT",
            "/repos/{owner}/{repo}/pulls/{number}/reviews/{reviewId}/dismissals",
            List.of("owner", "repo", "number", "reviewId"), List.of(), false, false, List.of(
                "Payload {message, event}.")));
        register(GithubAction.of("pullrequest.review", "delete", "DELETE",
            "/repos/{owner}/{repo}/pulls/{number}/reviews/{reviewId}",
            List.of("owner", "repo", "number", "reviewId"), List.of(), false, false, List.of()));

        // ---- Issue ----------------------------------------------------------
        register(GithubAction.of("issue", "list", "GET", "/repos/{owner}/{repo}/issues",
            List.of("owner", "repo"), List.of("state", "labels", "assignee", "creator", "mentioned",
                "milestone", "since", "sort", "direction", "per_page", "page"), false, true, List.of()));
        register(GithubAction.of("issue", "get", "GET", "/repos/{owner}/{repo}/issues/{number}",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of()));
        register(GithubAction.of("issue", "create", "POST", "/repos/{owner}/{repo}/issues",
            List.of("owner", "repo"), List.of(), false, false, List.of("Payload {title, body, labels, assignees}.")));
        register(GithubAction.of("issue", "update", "PATCH", "/repos/{owner}/{repo}/issues/{number}",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of()));
        register(GithubAction.of("issue", "delete", "DELETE", "/repos/{owner}/{repo}/issues/{number}",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of(
                "Deletes an issue. GitHub returns 204 on success.")));
        register(GithubAction.of("issue", "close", "PATCH", "/repos/{owner}/{repo}/issues/{number}",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of("Sets state=closed.")));
        register(GithubAction.of("issue", "reopen", "PATCH", "/repos/{owner}/{repo}/issues/{number}",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of("Sets state=open.")));
        register(GithubAction.of("issue", "lock", "PUT", "/repos/{owner}/{repo}/issues/{number}/lock",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of("Payload {lock_reason}.")));
        register(GithubAction.of("issue", "unlock", "DELETE", "/repos/{owner}/{repo}/issues/{number}/lock",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of()));

        // ---- Issue Label ----------------------------------------------------
        register(GithubAction.of("issue.label", "list", "GET", "/repos/{owner}/{repo}/labels",
            List.of("owner", "repo"), List.of("per_page", "page"), false, true, List.of()));
        register(GithubAction.of("issue.label", "get", "GET", "/repos/{owner}/{repo}/labels/{name}",
            List.of("owner", "repo", "name"), List.of(), false, false, List.of()));
        register(GithubAction.of("issue.label", "create", "POST", "/repos/{owner}/{repo}/labels",
            List.of("owner", "repo"), List.of(), false, false, List.of(
                "Payload {name, color, description}.")));
        register(GithubAction.of("issue.label", "update", "PATCH", "/repos/{owner}/{repo}/labels/{name}",
            List.of("owner", "repo", "name"), List.of(), false, false, List.of(
                "Payload {new_name, color, description}.")));
        register(GithubAction.of("issue.label", "delete", "DELETE", "/repos/{owner}/{repo}/labels/{name}",
            List.of("owner", "repo", "name"), List.of(), false, false, List.of()));
        register(GithubAction.of("issue.label", "add", "POST", "/repos/{owner}/{repo}/issues/{number}/labels",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of("Payload {labels: [...]}.")));
        register(GithubAction.of("issue.label", "remove", "DELETE",
            "/repos/{owner}/{repo}/issues/{number}/labels/{name}",
            List.of("owner", "repo", "number", "name"), List.of(), false, false, List.of()));
        register(GithubAction.of("issue.label", "set", "PUT", "/repos/{owner}/{repo}/issues/{number}/labels",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of(
                "Replaces all labels on the issue. Payload {labels: [...]}.")));
        register(GithubAction.of("issue.label", "list-on-issue", "GET",
            "/repos/{owner}/{repo}/issues/{number}/labels",
            List.of("owner", "repo", "number"), List.of("per_page", "page"), false, true, List.of()));

        // ---- Issue Comment --------------------------------------------------
        register(GithubAction.of("issue.comment", "add", "POST", "/repos/{owner}/{repo}/issues/{number}/comments",
            List.of("owner", "repo", "number"), List.of(), false, false, List.of("Payload {body}.")));
        register(GithubAction.of("issue.comment", "list", "GET", "/repos/{owner}/{repo}/issues/{number}/comments",
            List.of("owner", "repo", "number"), List.of("since", "per_page", "page"), false, true, List.of()));
        register(GithubAction.of("issue.comment", "get", "GET", "/repos/{owner}/{repo}/issues/comments/{commentId}",
            List.of("owner", "repo", "commentId"), List.of(), false, false, List.of()));
        register(GithubAction.of("issue.comment", "update", "PATCH", "/repos/{owner}/{repo}/issues/comments/{commentId}",
            List.of("owner", "repo", "commentId"), List.of(), false, false, List.of("Payload {body}.")));
        register(GithubAction.of("issue.comment", "delete", "DELETE", "/repos/{owner}/{repo}/issues/comments/{commentId}",
            List.of("owner", "repo", "commentId"), List.of(), false, false, List.of()));

        // ---- Release --------------------------------------------------------
        register(GithubAction.of("release", "list", "GET", "/repos/{owner}/{repo}/releases",
            List.of("owner", "repo"), List.of("per_page", "page"), false, true, List.of()));
        register(GithubAction.of("release", "get", "GET", "/repos/{owner}/{repo}/releases/{releaseId}",
            List.of("owner", "repo", "releaseId"), List.of(), false, false, List.of()));
        register(GithubAction.of("release", "get-by-tag", "GET", "/repos/{owner}/{repo}/releases/tags/{tag}",
            List.of("owner", "repo", "tag"), List.of(), false, false, List.of()));
        register(GithubAction.of("release", "create", "POST", "/repos/{owner}/{repo}/releases",
            List.of("owner", "repo"), List.of(), false, false, List.of("Payload {tag_name, name, body, draft, prerelease}.")));
        register(GithubAction.of("release", "update", "PATCH", "/repos/{owner}/{repo}/releases/{releaseId}",
            List.of("owner", "repo", "releaseId"), List.of(), false, false, List.of()));
        register(GithubAction.of("release", "delete", "DELETE", "/repos/{owner}/{repo}/releases/{releaseId}",
            List.of("owner", "repo", "releaseId"), List.of(), false, false, List.of()));

        // ---- Release Asset --------------------------------------------------
        register(GithubAction.of("release.asset", "upload", "POST",
            "/repos/{owner}/{repo}/releases/{releaseId}/assets",
            List.of("owner", "repo", "releaseId"), List.of("name", "label"), false, false, List.of(
                "Raw binary upload. Payload is the file content; required query/configuration name.")));
        register(GithubAction.of("release.asset", "list", "GET",
            "/repos/{owner}/{repo}/releases/{releaseId}/assets",
            List.of("owner", "repo", "releaseId"), List.of("per_page", "page"), false, true, List.of()));
        register(GithubAction.of("release.asset", "get", "GET",
            "/repos/{owner}/{repo}/releases/assets/{assetId}",
            List.of("owner", "repo", "assetId"), List.of(), false, false, List.of()));
        register(GithubAction.of("release.asset", "update", "PATCH",
            "/repos/{owner}/{repo}/releases/assets/{assetId}",
            List.of("owner", "repo", "assetId"), List.of(), false, false, List.of(
                "Payload {name, label, state}.")));
        register(GithubAction.of("release.asset", "delete", "DELETE",
            "/repos/{owner}/{repo}/releases/assets/{assetId}",
            List.of("owner", "repo", "assetId"), List.of(), false, false, List.of()));

        // ---- Tag ------------------------------------------------------------
        register(GithubAction.of("tag", "list", "GET", "/repos/{owner}/{repo}/tags",
            List.of("owner", "repo"), List.of("per_page", "page"), false, true, List.of()));
        register(GithubAction.of("tag", "get", "GET", "/repos/{owner}/{repo}/git/ref/tags/{tag}",
            List.of("owner", "repo", "tag"), List.of(), false, false, List.of()));
        register(GithubAction.of("tag", "create", "POST", "/repos/{owner}/{repo}/git/refs",
            List.of("owner", "repo"), List.of(), false, false, List.of("Payload {ref: refs/tags/{tag}, sha}.")));
        register(GithubAction.of("tag", "delete", "DELETE", "/repos/{owner}/{repo}/git/refs/tags/{tag}",
            List.of("owner", "repo", "tag"), List.of(), false, false, List.of()));

        // ---- Workflow -------------------------------------------------------
        register(GithubAction.of("workflow", "list", "GET", "/repos/{owner}/{repo}/actions/workflows",
            List.of("owner", "repo"), List.of("per_page", "page"), false, true, List.of()));
        register(GithubAction.of("workflow", "get", "GET", "/repos/{owner}/{repo}/actions/workflows/{workflowId}",
            List.of("owner", "repo", "workflowId"), List.of(), false, false, List.of()));
        register(GithubAction.of("workflow", "trigger", "POST",
            "/repos/{owner}/{repo}/actions/workflows/{workflowId}/dispatches",
            List.of("owner", "repo", "workflowId"), List.of(), false, false, List.of("Payload {ref, inputs}.")));
        register(GithubAction.of("workflow", "disable", "PUT",
            "/repos/{owner}/{repo}/actions/workflows/{workflowId}/disable",
            List.of("owner", "repo", "workflowId"), List.of(), false, false, List.of()));
        register(GithubAction.of("workflow", "enable", "PUT",
            "/repos/{owner}/{repo}/actions/workflows/{workflowId}/enable",
            List.of("owner", "repo", "workflowId"), List.of(), false, false, List.of()));

        // ---- Workflow Run ---------------------------------------------------
        register(GithubAction.of("workflow.run", "list", "GET", "/repos/{owner}/{repo}/actions/runs",
            List.of("owner", "repo"), List.of("workflow_id", "branch", "event", "status",
                "created", "check_suite_id", "per_page", "page"), false, true, List.of()));
        register(GithubAction.of("workflow.run", "get", "GET", "/repos/{owner}/{repo}/actions/runs/{runId}",
            List.of("owner", "repo", "runId"), List.of(), false, false, List.of()));
        register(GithubAction.of("workflow.run", "cancel", "POST", "/repos/{owner}/{repo}/actions/runs/{runId}/cancel",
            List.of("owner", "repo", "runId"), List.of(), false, false, List.of()));
        register(GithubAction.of("workflow.run", "rerun", "POST", "/repos/{owner}/{repo}/actions/runs/{runId}/rerun",
            List.of("owner", "repo", "runId"), List.of(), false, false, List.of()));
        register(GithubAction.of("workflow.run", "rerun-failed-jobs", "POST",
            "/repos/{owner}/{repo}/actions/runs/{runId}/rerun-failed-jobs",
            List.of("owner", "repo", "runId"), List.of(), false, false, List.of()));
        register(GithubAction.of("workflow.run", "delete", "DELETE", "/repos/{owner}/{repo}/actions/runs/{runId}",
            List.of("owner", "repo", "runId"), List.of(), false, false, List.of()));
        register(GithubAction.of("workflow.run", "list-jobs", "GET",
            "/repos/{owner}/{repo}/actions/runs/{runId}/jobs",
            List.of("owner", "repo", "runId"), List.of("filter", "per_page", "page"), false, true, List.of()));
        register(GithubAction.of("workflow.run", "list-attempts", "GET",
            "/repos/{owner}/{repo}/actions/runs/{runId}/attempts/{attemptNumber}",
            List.of("owner", "repo", "runId", "attemptNumber"), List.of("per_page", "page"), false, false, List.of()));

        // ---- Organization ---------------------------------------------------
        register(GithubAction.of("organization", "get", "GET", "/orgs/{org}",
            List.of("org"), List.of(), false, false, List.of()));
        register(GithubAction.of("organization", "update", "PATCH", "/orgs/{org}",
            List.of("org"), List.of(), false, false, List.of()));
        register(GithubAction.of("organization", "list-repositories", "GET", "/orgs/{org}/repos",
            List.of("org"), List.of("type", "sort", "direction", "per_page", "page"), false, true, List.of()));
        register(GithubAction.of("organization", "list-members", "GET", "/orgs/{org}/members",
            List.of("org"), List.of("role", "filter", "per_page", "page"), false, true, List.of()));
        register(GithubAction.of("organization", "get-member", "GET", "/orgs/{org}/members/{username}",
            List.of("org", "username"), List.of(), false, false, List.of(
                "Returns 204 if the user is a member, 404 otherwise.")));
        register(GithubAction.of("organization", "list-teams", "GET", "/orgs/{org}/teams",
            List.of("org"), List.of("per_page", "page"), false, true, List.of()));

        // ---- User -----------------------------------------------------------
        register(GithubAction.of("user", "get-current", "GET", "/user",
            List.of(), List.of(), true, false, List.of()));
        register(GithubAction.of("user", "get-user", "GET", "/users/{username}",
            List.of("username"), List.of(), false, false, List.of()));
        register(GithubAction.of("user", "list-repositories", "GET", "/users/{username}/repos",
            List.of("username"), List.of("type", "sort", "direction", "per_page", "page"), false, true, List.of()));
        register(GithubAction.of("user", "list-followers", "GET", "/users/{username}/followers",
            List.of("username"), List.of("per_page", "page"), false, true, List.of()));
        register(GithubAction.of("user", "list-following", "GET", "/users/{username}/following",
            List.of("username"), List.of("per_page", "page"), false, true, List.of()));

        // ---- Webhook (repo-level) -------------------------------------------
        register(GithubAction.of("webhook", "list", "GET", "/repos/{owner}/{repo}/hooks",
            List.of("owner", "repo"), List.of("per_page", "page"), false, true, List.of()));
        register(GithubAction.of("webhook", "get", "GET", "/repos/{owner}/{repo}/hooks/{hookId}",
            List.of("owner", "repo", "hookId"), List.of(), false, false, List.of()));
        register(GithubAction.of("webhook", "create", "POST", "/repos/{owner}/{repo}/hooks",
            List.of("owner", "repo"), List.of(), false, false, List.of("Payload {name: web, config: {url, content_type, secret}, events}.")));
        register(GithubAction.of("webhook", "update", "PATCH", "/repos/{owner}/{repo}/hooks/{hookId}",
            List.of("owner", "repo", "hookId"), List.of(), false, false, List.of()));
        register(GithubAction.of("webhook", "delete", "DELETE", "/repos/{owner}/{repo}/hooks/{hookId}",
            List.of("owner", "repo", "hookId"), List.of(), false, false, List.of()));
        register(GithubAction.of("webhook", "ping", "POST", "/repos/{owner}/{repo}/hooks/{hookId}/pings",
            List.of("owner", "repo", "hookId"), List.of(), false, false, List.of()));
        register(GithubAction.of("webhook", "list-deliveries", "GET",
            "/repos/{owner}/{repo}/hooks/{hookId}/deliveries",
            List.of("owner", "repo", "hookId"), List.of("per_page", "page", "cursor"), false, true, List.of()));
        register(GithubAction.of("webhook", "get-delivery", "GET",
            "/repos/{owner}/{repo}/hooks/{hookId}/deliveries/{deliveryId}",
            List.of("owner", "repo", "hookId", "deliveryId"), List.of(), false, false, List.of()));
        register(GithubAction.of("webhook", "redeliver", "POST",
            "/repos/{owner}/{repo}/hooks/{hookId}/deliveries/{deliveryId}/attempts",
            List.of("owner", "repo", "hookId", "deliveryId"), List.of(), false, false, List.of()));

        // ---- Webhook Event (local handling) ----------------------------------
        register(GithubAction.local("webhook.event", "receive"));
        register(GithubAction.local("webhook.event", "verify"));
        register(GithubAction.local("webhook.event", "route-event"));

        // ---- Search ---------------------------------------------------------
        register(GithubAction.of("search", "repositories", "GET", "/search/repositories",
            List.of(), List.of("q", "sort", "order", "per_page", "page"), false, true, List.of("query.q is required.")));
        register(GithubAction.of("search", "code", "GET", "/search/code",
            List.of(), List.of("q", "sort", "order", "per_page", "page"), true, true, List.of("Code search requires authentication.")));
        register(GithubAction.of("search", "issues", "GET", "/search/issues",
            List.of(), List.of("q", "sort", "order", "per_page", "page"), false, true, List.of()));
        register(GithubAction.of("search", "users", "GET", "/search/users",
            List.of(), List.of("q", "sort", "order", "per_page", "page"), false, true, List.of()));

        // ---- Notification ---------------------------------------------------
        register(GithubAction.of("notification", "list", "GET", "/notifications",
            List.of(), List.of("all", "participating", "since", "per_page", "page"), true, true, List.of()));
        register(GithubAction.of("notification", "mark-read", "PUT", "/notifications",
            List.of(), List.of(), true, false, List.of("Payload {last_read_at}. Marks all as read.")));
    }

    public GithubAction require(String operation) {
        GithubAction action = byOperation.get(operation);
        if (action == null) {
            throw new IllegalArgumentException(
                "Unsupported GitHub operation '" + operation + "'. Expected one of: " + operationNames());
        }
        return action;
    }

    public GithubAction get(String operation) {
        return byOperation.get(operation);
    }

    public List<GithubAction> all() {
        return new ArrayList<>(byOperation.values());
    }

    public List<String> operationNames() {
        return new ArrayList<>(byOperation.keySet());
    }

    public boolean contains(String operation) {
        return byOperation.containsKey(operation);
    }
}
