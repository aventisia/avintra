package camel.harness.connectors.github.workflow;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubServiceTestSupport;

/**
 * Focused tests for the {@code workflow} service family and the
 * {@code workflow.run} sub-service.
 */
class WorkflowServiceTest extends GithubServiceTestSupport {

    @Test
    void triggerUsesPostOnDispatches() {
        GithubAction action = actions.require("workflow.trigger");
        assertEquals("POST", action.method());
        assertEquals("/repos/{owner}/{repo}/actions/workflows/{workflowId}/dispatches", action.path());
        assertEquals(java.util.List.of("owner", "repo", "workflowId"), action.pathParams());
    }

    @Test
    void triggerResolvesToDirectRoute() {
        assertEquals("direct:github.workflow.trigger", resolveRoute("workflow.trigger"));
    }

    @Test
    void runCancelUsesPost() {
        GithubAction action = actions.require("workflow.run.cancel");
        assertEquals("workflow.run", action.service());
        assertEquals("POST", action.method());
        assertEquals("/repos/{owner}/{repo}/actions/runs/{runId}/cancel", action.path());
        assertEquals(java.util.List.of("owner", "repo", "runId"), action.pathParams());
    }

    @Test
    void runListIsPaginated() {
        assertEquals(true, actions.require("workflow.run.list").paginated());
    }

    @Test
    void runRerunResolvesToDirectRoute() {
        assertEquals("direct:github.workflow.run.rerun", resolveRoute("workflow.run.rerun"));
    }

    @Test
    void disableEnableUsePut() {
        GithubAction disable = actions.require("workflow.disable");
        assertEquals("PUT", disable.method());
        assertEquals("/repos/{owner}/{repo}/actions/workflows/{workflowId}/disable", disable.path());

        GithubAction enable = actions.require("workflow.enable");
        assertEquals("PUT", enable.method());
        assertEquals("/repos/{owner}/{repo}/actions/workflows/{workflowId}/enable", enable.path());
    }

    @Test
    void runRerunFailedJobsAndDeleteAreRegistered() {
        GithubAction rerunFailed = actions.require("workflow.run.rerun-failed-jobs");
        assertEquals("POST", rerunFailed.method());
        assertEquals("/repos/{owner}/{repo}/actions/runs/{runId}/rerun-failed-jobs", rerunFailed.path());

        GithubAction delete = actions.require("workflow.run.delete");
        assertEquals("DELETE", delete.method());
        assertEquals("/repos/{owner}/{repo}/actions/runs/{runId}", delete.path());
    }

    @Test
    void runListJobsAndAttemptsAreRegistered() {
        GithubAction jobs = actions.require("workflow.run.list-jobs");
        assertEquals("GET", jobs.method());
        assertEquals("/repos/{owner}/{repo}/actions/runs/{runId}/jobs", jobs.path());
        assertEquals(true, jobs.paginated());

        GithubAction attempts = actions.require("workflow.run.list-attempts");
        assertEquals("GET", attempts.method());
        assertEquals("/repos/{owner}/{repo}/actions/runs/{runId}/attempts/{attemptNumber}", attempts.path());
        assertEquals(java.util.List.of("owner", "repo", "runId", "attemptNumber"), attempts.pathParams());
    }

    @Test
    void runRoutesResolve() {
        assertEquals("direct:github.workflow.disable", resolveRoute("workflow.disable"));
        assertEquals("direct:github.workflow.enable", resolveRoute("workflow.enable"));
        assertEquals("direct:github.workflow.run.rerun-failed-jobs", resolveRoute("workflow.run.rerun-failed-jobs"));
        assertEquals("direct:github.workflow.run.delete", resolveRoute("workflow.run.delete"));
        assertEquals("direct:github.workflow.run.list-jobs", resolveRoute("workflow.run.list-jobs"));
        assertEquals("direct:github.workflow.run.list-attempts", resolveRoute("workflow.run.list-attempts"));
    }
}
