package camel.harness.connectors.m365.service;

import camel.harness.connectors.m365.M365Configurer;
import camel.harness.connectors.m365.M365Defaults;
import camel.harness.connectors.m365.client.M365Client;
import camel.harness.connectors.m365.dto.M365PathParams;
import camel.harness.connectors.m365.dto.M365Request;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.core.ConnectorRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

import camel.harness.core.ConnectorRequest;

/**
 * Domain service for the {@code user} service family. Handles the complex
 * multi-step operations (license assignment/removal) that cannot be expressed as
 * a single generic Graph call. Simple operations are handled by the generic
 * descriptor path in {@link M365DispatchProcessor}.
 */
@Component("user")
public class M365UserService {

    private final M365Client client;

    public M365UserService(M365Client client) {
        this.client = client;
    }

    /**
     * Assigns one or more Microsoft 365 licenses to a user. Adds the license
     * plans to the user's {@code assignedLicenses}, disabling any conflicting
     * service plans first.
     */
    public Object assignLicense(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request.configurationOrEmpty();
        String userId = M365PathParams.userId(config, "user.assign-license");
        List<?> addLicenses = list(config, "addLicenses");
        List<?> removeLicenses = list(config, "removeLicenses");
        if (addLicenses.isEmpty() && removeLicenses.isEmpty()) {
            // Allow the licenses to be provided via the payload.
            Object payload = request.payload();
            if (payload instanceof Map<?, ?> map) {
                Object add = map.get("addLicenses");
                Object remove = map.get("removeLicenses");
                if (add instanceof List<?> l) {
                    addLicenses = l;
                }
                if (remove instanceof List<?> l) {
                    removeLicenses = l;
                }
            }
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("addLicenses", addLicenses);
        body.put("removeLicenses", removeLicenses);
        M365Request req = M365Request.builder()
            .path("/users/" + urlEncode(userId) + "/assignLicense")
            .httpMethod("POST")
            .body(body)
            .auth(request.auth())
            .build();
        return client.execute(M365Defaults.baseUrl(null), req).body();
    }

    /**
     * Removes one or more Microsoft 365 licenses from a user.
     */
    public Object removeLicense(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request.configurationOrEmpty();
        String userId = M365PathParams.userId(config, "user.remove-license");
        Object payload = request.payload();
        List<?> removeLicenses;
        if (payload instanceof Map<?, ?> map && map.get("removeLicenses") instanceof List<?> list) {
            removeLicenses = list;
        } else if (config.get("removeLicenses") instanceof List<?> list) {
            removeLicenses = list;
        } else {
            throw new M365Exception("user.remove-license requires removeLicenses (list of SKU ids) in payload or configuration", 400);
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("removeLicenses", removeLicenses);
        body.put("addLicenses", List.of());
        M365Request req = M365Request.builder()
            .path("/users/" + urlEncode(userId) + "/assignLicense")
            .httpMethod("POST")
            .body(body)
            .auth(request.auth())
            .build();
        return client.execute(M365Defaults.baseUrl(null), req).body();
    }

    private static ConnectorRequest Request(Exchange exchange) {
        return exchange.getProperty(M365Configurer.PROP_REQUEST, ConnectorRequest.class);
    }

    private static List<?> list(Map<String, Object> config, String key) {
        Object value = config.get(key);
        return value instanceof List<?> list ? list : List.of();
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
