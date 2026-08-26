package camel.harness.connectors.m365.service;

import camel.harness.connectors.m365.M365Configurer;
import camel.harness.connectors.m365.M365Defaults;
import camel.harness.connectors.m365.client.M365Client;
import camel.harness.connectors.m365.dto.M365PathParams;
import camel.harness.connectors.m365.dto.M365Request;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.core.ConnectorRequest;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

import camel.harness.core.ConnectorRequest;

/**
 * Domain service for the {@code mailattachment} service family. Handles the
 * {@code add} operation, which creates a file attachment on a message (base64
 * content) or an item attachment.
 */
@Component("mailattachment")
public class M365MailAttachmentService {

    private final M365Client client;

    public M365MailAttachmentService(M365Client client) {
        this.client = client;
    }

    /**
     * Adds an attachment to a message. Payload: {name, contentBytes (base64) or
     * content, contentType, isInline} or {@code {"@odata.type": ...}} for item
     * attachments.
     */
    public Object add(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request.configurationOrEmpty();
        String userSegment = M365PathParams.userSegment(config, request.auth(),
            null, "mailattachment.add");
        String messageId = required(config, "messageId", "messageId is required for mailattachment.add");
        Object payload = request.payload();
        if (!(payload instanceof Map<?, ?> map)) {
            throw new M365Exception("mailattachment.add requires a payload map {name, contentBytes, contentType, ...}", 400);
        }
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("@odata.type", "#microsoft.graph.fileAttachment");
        map.forEach((k, v) -> body.put(String.valueOf(k), v));
        String content = asString(map.get("content"));
        if (content != null && !content.isBlank()) {
            // Accept raw content and base64-encode it for Graph.
            body.put("contentBytes", Base64.getEncoder().encodeToString(content.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
        }
        M365Request req = M365Request.builder()
            .path("/" + userSegment + "/messages/" + urlEncode(messageId) + "/attachments")
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
