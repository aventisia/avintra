package camel.harness.connectors.m365.todo;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code todo} service family.
 */
class ToDoServiceTest extends M365ServiceTestSupport {

    @Test
    void listListsMapsToDirectRoute() {
        assertEquals("direct:m365.todo.list-lists", resolveRoute("todo.list-lists"));
        assertEquals("/users/{userId}/todo/lists", actions.require("todo.list-lists").path());
    }

    @Test
    void getTaskDeclaresPathParams() {
        M365Action action = actions.require("todo.get-task");
        assertEquals(java.util.List.of("userId", "listId", "taskId"), action.pathParams());
    }

    @Test
    void completeTaskUsesCompletePath() {
        M365Action action = actions.require("todo.complete-task");
        assertEquals("/users/{userId}/todo/lists/{listId}/tasks/{taskId}/complete", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void unknownToDoActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("todo.nonexistent"));
    }

    @Test
    void allToDoOperationsRegistered() {
        assertTrue(actions.contains("todo.list-lists"));
        assertTrue(actions.contains("todo.get-list"));
        assertTrue(actions.contains("todo.create-list"));
        assertTrue(actions.contains("todo.update-list"));
        assertTrue(actions.contains("todo.delete-list"));
        assertTrue(actions.contains("todo.list-tasks"));
        assertTrue(actions.contains("todo.get-task"));
        assertTrue(actions.contains("todo.create-task"));
        assertTrue(actions.contains("todo.update-task"));
        assertTrue(actions.contains("todo.delete-task"));
        assertTrue(actions.contains("todo.complete-task"));
    }
}
