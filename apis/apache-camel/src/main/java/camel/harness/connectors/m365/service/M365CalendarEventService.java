package camel.harness.connectors.m365.service;

import camel.harness.connectors.m365.M365Configurer;
import camel.harness.connectors.m365.M365Defaults;
import camel.harness.connectors.m365.client.M365Client;
import camel.harness.connectors.m365.dto.M365PathParams;
import camel.harness.connectors.m365.dto.M365Request;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.core.ConnectorRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

import camel.harness.core.ConnectorRequest;

/**
 * Domain service for the {@code calendarattendee} service family. Graph models
 * attendees as part of the event resource, so add/update/remove are implemented
 * as read-modify-write on the event's {@code attendees} collection.
 */
@Component("calendarevent")
public class M365CalendarEventService {

    private final M365Client client;

    public M365CalendarEventService(M365Client client) {
        this.client = client;
    }

    /** Adds an attendee (payload: {emailAddress, type, status}) to an event. */
    public Object add(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request.configurationOrEmpty();
        String userSegment = M365PathParams.userSegment(config, request.auth(), null, "calendarattendee.add");
        String eventId = required(config, "eventId", "eventId is required for calendarattendee.add");
        Map<String, Object> attendee = attendeePayload(request);
        Map<String, Object> event = fetchEvent(exchange, userSegment, eventId, request.auth());
        List<Object> attendees = attendees(event);
        attendees.add(attendee);
        return patchEvent(exchange, userSegment, eventId, attendees, request.auth());
    }

    /** Updates an attendee by email address (payload: {emailAddress, ...new fields}). */
    public Object update(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request.configurationOrEmpty();
        String userSegment = M365PathParams.userSegment(config, request.auth(), null, "calendarattendee.update");
        String eventId = required(config, "eventId", "eventId is required for calendarattendee.update");
        Map<String, Object> attendee = attendeePayload(request);
        Object email = attendee.get("emailAddress");
        String emailAddress = email instanceof Map<?, ?> m ? asString(m.get("address")) : asString(attendee.get("emailAddress"));
        Map<String, Object> event = fetchEvent(exchange, userSegment, eventId, request.auth());
        List<Object> attendees = attendees(event);
        boolean found = false;
        for (Object item : attendees) {
            if (item instanceof Map<?, ?> existing) {
                Object existingEmail = existing.get("emailAddress");
                String existingAddress = existingEmail instanceof Map<?, ?> m
                    ? asString(m.get("address")) : null;
                if (existingAddress != null && existingAddress.equalsIgnoreCase(emailAddress)) {
                    Map<String, Object> merged = new LinkedHashMap<>();
                    existing.forEach((k, v) -> merged.put(String.valueOf(k), v));
                    attendee.forEach((k, v) -> merged.put(String.valueOf(k), v));
                    attendees.set(attendees.indexOf(item), merged);
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            throw new M365Exception("calendarattendee.update: attendee '" + emailAddress + "' not found on event", 404);
        }
        return patchEvent(exchange, userSegment, eventId, attendees, request.auth());
    }

    /** Removes an attendee by email address (payload: {emailAddress}). */
    public Object remove(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request.configurationOrEmpty();
        String userSegment = M365PathParams.userSegment(config, request.auth(), null, "calendarattendee.remove");
        String eventId = required(config, "eventId", "eventId is required for calendarattendee.remove");
        Map<String, Object> attendee = attendeePayload(request);
        Object email = attendee.get("emailAddress");
        String emailAddress = email instanceof Map<?, ?> m ? asString(m.get("address")) : String.valueOf(attendee.get("emailAddress"));
        Map<String, Object> event = fetchEvent(exchange, userSegment, eventId, request.auth());
        List<Object> attendees = attendees(event);
        attendees.removeIf(item -> {
            if (item instanceof Map<?, ?> existing) {
                Object existingEmail = existing.get("emailAddress");
                String existingAddress = existingEmail instanceof Map<?, ?> m ? asString(m.get("address")) : null;
                return existingAddress != null && existingAddress.equalsIgnoreCase(emailAddress);
            }
            return false;
        });
        return patchEvent(exchange, userSegment, eventId, attendees, request.auth());
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private Map<String, Object> fetchEvent(Exchange exchange, String userSegment, String eventId,
            camel.harness.core.AuthConfiguration auth) {
        M365Request req = M365Request.builder()
            .path("/" + userSegment + "/events/" + urlEncode(eventId))
            .httpMethod("GET")
            .queryParam("$select", "attendees")
            .auth(auth)
            .build();
        Object result = client.execute(effectiveBaseUrl(exchange), req).body();
        if (result instanceof Map<?, ?> map) {
            Map<String, Object> copy = new LinkedHashMap<>();
            map.forEach((k, v) -> copy.put(String.valueOf(k), v));
            return copy;
        }
        throw new M365Exception("calendarattendee: could not read event " + eventId, 404);
    }

    private Object patchEvent(Exchange exchange, String userSegment, String eventId,
            List<Object> attendees, camel.harness.core.AuthConfiguration auth) {
        M365Request req = M365Request.builder()
            .path("/" + userSegment + "/events/" + urlEncode(eventId))
            .httpMethod("PATCH")
            .body(Map.of("attendees", attendees))
            .auth(auth)
            .build();
        return client.execute(effectiveBaseUrl(exchange), req).body();
    }

    private static List<Object> attendees(Map<String, Object> event) {
        Object value = event.get("attendees");
        if (value instanceof List<?> list) {
            List<Object> result = new ArrayList<>();
            result.addAll(list);
            return result;
        }
        return new ArrayList<>();
    }

    private static Map<String, Object> attendeePayload(ConnectorRequest request) {
        Object payload = request.payload();
        if (!(payload instanceof Map<?, ?> map)) {
            throw new M365Exception("calendarattendee requires a payload map {emailAddress, name, type}", 400);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        map.forEach((k, v) -> result.put(String.valueOf(k), v));
        return result;
    }

    private static ConnectorRequest Request(Exchange exchange) {
        return exchange.getProperty(M365Configurer.PROP_REQUEST, ConnectorRequest.class);
    }

    private static String effectiveBaseUrl(Exchange exchange) {
        String configured = exchange.getProperty(M365Configurer.PROP_BASE_URL, String.class);
        return configured != null && !configured.isBlank()
            ? stripTrailingSlash(configured) : M365Defaults.DEFAULT_BASE_URL;
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private static String required(Map<String, Object> config, String key, String message) {
        Object value = config.get(key);
        if (value == null || String.valueOf(value).isBlank()) {
            throw new M365Exception(message, 400);
        }
        return String.valueOf(value);
    }

    private static String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
