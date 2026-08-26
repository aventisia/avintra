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
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import camel.harness.core.ConnectorRequest;

/**
 * Domain service for the {@code mail} service family. Handles the complex
 * {@code send} operation (send an existing draft or a message with inline
 * attachments/recipients) that benefits from centralized request building.
 */
@Component("mail")
public class M365MailService {

    private final M365Client client;
    private final Environment environment;

    public M365MailService(M365Client client, Environment environment) {
        this.client = client;
        this.environment = environment;
    }

    /**
     * Sends a message. If {@code configuration.messageId} is present the existing
     * draft is sent; otherwise the payload is posted to the user's
     * {@code sendMail} action. Payload: {message: {...}} or {subject, body, toRecipients,...}.
     */
    public Object send(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request.configurationOrEmpty();
        String userSegment = M365PathParams.userSegment(config, request.auth(), environment, "mail.send");
        String messageId = config.get("messageId") != null ? String.valueOf(config.get("messageId")) : null;

        if (messageId != null && !messageId.isBlank()) {
            // Send an existing draft.
            M365Request req = M365Request.builder()
                .path("/" + userSegment + "/messages/" + urlEncode(messageId) + "/send")
                .httpMethod("POST")
                .auth(request.auth())
                .build();
            return client.execute(effectiveBaseUrl(exchange), req).body();
        }

        Object payload = request.payload();
        Map<String, Object> message;
        if (payload instanceof Map<?, ?> map) {
            Object inner = map.get("message");
            if (inner instanceof Map<?, ?> innerMap) {
                message = new LinkedHashMap<>();
                innerMap.forEach((k, v) -> message.put(String.valueOf(k), v));
            } else {
                message = new LinkedHashMap<>();
                map.forEach((k, v) -> message.put(String.valueOf(k), v));
            }
        } else {
            throw new M365Exception("mail.send requires a payload: {message: {...}} or message fields", 400);
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", message);
        if (config.get("saveToSentItems") != null) {
            body.put("saveToSentItems", config.get("saveToSentItems"));
        }
        String baseUrl = effectiveBaseUrl(exchange);
        M365Request req = M365Request.builder()
            .path("/" + userSegment + "/sendMail")
            .httpMethod("POST")
            .body(body)
            .auth(request.auth())
            .build();
        return client.execute(baseUrl, req).body();
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

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
