package camel.harness.connectors.m365.calendar;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365ServiceTestSupport;

/**
 * Focused tests for the {@code calendar}, {@code calendarevent}, and
 * {@code calendarattendee} service families.
 */
class CalendarServiceTest extends M365ServiceTestSupport {

    @Test
    void calendarGetMapsToDirectRoute() {
        assertEquals("direct:m365.calendar.get", resolveRoute("calendar.get"));
        assertEquals("/users/{userId}/calendar", actions.require("calendar.get").path());
    }

    @Test
    void calendarListIsPaginated() {
        assertEquals(true, actions.require("calendar.list").paginated());
    }

    @Test
    void eventCreateUsesCalendarEventsPath() {
        M365Action action = actions.require("calendarevent.create");
        assertEquals("/users/{userId}/calendar/events", action.path());
        assertEquals("POST", action.method());
    }

    @Test
    void eventCancelUsesCancelPath() {
        M365Action action = actions.require("calendarevent.cancel");
        assertEquals("/users/{userId}/events/{eventId}/cancel", action.path());
    }

    @Test
    void eventTentativelyAcceptUsesCorrectPath() {
        M365Action action = actions.require("calendarevent.tentatively-accept");
        assertEquals("/users/{userId}/events/{eventId}/tentativelyAccept", action.path());
    }

    @Test
    void eventListIsPaginated() {
        assertEquals(true, actions.require("calendarevent.list").paginated());
    }

    @Test
    void attendeeAddIsDelegate() {
        M365Action action = actions.require("calendarattendee.add");
        assertEquals(true, action.hasDelegate());
        assertEquals("calendarevent", action.delegate());
    }

    @Test
    void attendeeListIsPaginated() {
        assertEquals(true, actions.require("calendarattendee.list").paginated());
    }

    @Test
    void unknownCalendarActionRejected() {
        assertThrows(IllegalArgumentException.class, () -> actions.require("calendar.nonexistent"));
    }

    @Test
    void allCalendarOperationsRegistered() {
        assertTrue(actions.contains("calendar.get"));
        assertTrue(actions.contains("calendar.list"));
        assertTrue(actions.contains("calendar.create"));
        assertTrue(actions.contains("calendar.update"));
        assertTrue(actions.contains("calendar.delete"));
        assertTrue(actions.contains("calendarevent.get"));
        assertTrue(actions.contains("calendarevent.list"));
        assertTrue(actions.contains("calendarevent.create"));
        assertTrue(actions.contains("calendarevent.update"));
        assertTrue(actions.contains("calendarevent.delete"));
        assertTrue(actions.contains("calendarevent.cancel"));
        assertTrue(actions.contains("calendarevent.accept"));
        assertTrue(actions.contains("calendarevent.decline"));
        assertTrue(actions.contains("calendarevent.tentatively-accept"));
        assertTrue(actions.contains("calendarevent.forward"));
        assertTrue(actions.contains("calendarattendee.add"));
        assertTrue(actions.contains("calendarattendee.update"));
        assertTrue(actions.contains("calendarattendee.remove"));
        assertTrue(actions.contains("calendarattendee.list"));
    }
}
