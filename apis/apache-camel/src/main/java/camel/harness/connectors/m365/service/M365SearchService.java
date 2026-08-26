package camel.harness.connectors.m365.service;

import camel.harness.connectors.m365.M365Configurer;
import camel.harness.connectors.m365.M365Defaults;
import camel.harness.connectors.m365.client.M365Client;
import camel.harness.connectors.m365.dto.M365Request;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.core.ConnectorRequest;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

import camel.harness.core.ConnectorRequest;

/**
 * Domain service for the {@code search} service family. Microsoft Graph search
 * uses the {@code /search/query} endpoint with a POST body; each action maps to
 * a different entity type in the {@code requests[0].entityTypes} list.
 */
@Component("search")
public class M365SearchService {

    private final M365Client client;

    public M365SearchService(M365Client client) {
        this.client = client;
    }

    public Object mail(Exchange exchange) {
        return search(exchange, "message");
    }

    public Object files(Exchange exchange) {
        return search(exchange, "driveItem");
    }

    public Object sites(Exchange exchange) {
        return search(exchange, "site");
    }

    public Object users(Exchange exchange) {
        return search(exchange, "user");
    }

    public Object messages(Exchange exchange) {
        return search(exchange, "message");
    }

    private Object search(Exchange exchange, String entityType) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request.configurationOrEmpty();
        Object q = config.get("q");
        if (q == null) {
            q = request.payload() instanceof Map<?, ?> map ? map.get("q") : null;
        }
        if (q == null || String.valueOf(q).isBlank()) {
            throw new M365Exception("search requires a query: configuration.q or payload.q", 400);
        }
        Map<String, Object> searchRequest = new LinkedHashMap<>();
        searchRequest.put("entityTypes", new String[] { entityType });
        Map<String, Object> query = new LinkedHashMap<>();
        query.put("queryString", String.valueOf(q));
        searchRequest.put("query", query);
        Object from = config.get("from");
        Object size = config.get("size");
        if (from != null) {
            searchRequest.put("from", Integer.parseInt(String.valueOf(from)));
        }
        if (size != null) {
            searchRequest.put("size", Integer.parseInt(String.valueOf(size)));
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("requests", new Object[] { searchRequest });
        M365Request req = M365Request.builder()
            .path("/search/query")
            .httpMethod("POST")
            .body(body)
            .auth(request.auth())
            .build();
        return client.execute(effectiveBaseUrl(exchange), req).body();
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
}
