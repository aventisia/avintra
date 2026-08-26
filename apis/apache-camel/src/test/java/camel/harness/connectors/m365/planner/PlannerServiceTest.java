package camel.harness.connectors.m365.planner;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code planner} service family.
 */
class PlannerServiceTest extends M365ServiceTestSupport {

    @Test
    void listPlansMapsToDirectRoute() {
        assertEquals("direct:m365.planner.list-plans", resolveRoute("planner.list-plans"));
        assertEquals("/users/{userId}/planner/plans", actions.require("planner.list-plans").path());
        assertEquals(true, actions.require("planner.list-plans").paginated());
    }

    @Test
    void createTaskUsesPlannerTasksPath() {
        M365Action action = actions.require("planner.create-task");
        assertEquals("/planner/tasks", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void updateTaskRequiresIfMatchNote() {
        M365Action action = actions.require("planner.update-task");
        assertEquals("/planner/tasks/{taskId}", action.path());
        assertEquals(true, action.notes().toString().contains("If-Match"));
    }

    @Test
    void completeTaskUsesDetailsPath() {
        M365Action action = actions.require("planner.complete-task");
        assertEquals("/planner/tasks/{taskId}/details", action.path());
    }

    @Test
    void unknownPlannerActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("planner.nonexistent"));
    }

    @Test
    void allPlannerOperationsRegistered() {
        assertTrue(actions.contains("planner.list-plans"));
        assertTrue(actions.contains("planner.get-plan"));
        assertTrue(actions.contains("planner.create-plan"));
        assertTrue(actions.contains("planner.update-plan"));
        assertTrue(actions.contains("planner.delete-plan"));
        assertTrue(actions.contains("planner.list-tasks"));
        assertTrue(actions.contains("planner.get-task"));
        assertTrue(actions.contains("planner.create-task"));
        assertTrue(actions.contains("planner.update-task"));
        assertTrue(actions.contains("planner.delete-task"));
        assertTrue(actions.contains("planner.complete-task"));
    }
}
