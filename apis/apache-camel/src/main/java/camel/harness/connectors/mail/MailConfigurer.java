package camel.harness.connectors.mail;

import camel.harness.core.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

@Component
public class MailConfigurer implements ConnectorConfigurer {

    @Override
    public String connectorName() {
        return "mail";
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        String targetUri = request.targetUri();
        Map<String, Object> config = request.configurationOrEmpty();

        if (targetUri == null || targetUri.isBlank()) {
            String scheme = (String) config.getOrDefault("scheme", "smtp");
            String host = (String) config.get("host");
            if (host == null || host.isBlank()) {
                throw new IllegalArgumentException("Mail host is required in configuration.host or targetUri");
            }
            int port = parsePort(config.get("port"));
            // Port 465 is the SSL-wrapped SMTPS port; 587 uses plain SMTP+STARTTLS.
            if ("smtp".equalsIgnoreCase(scheme) && port == 465) {
                scheme = "smtps";
            }
            StringBuilder uri = new StringBuilder(scheme).append("://").append(host);
            if (port > 0) {
                uri.append(":").append(port);
            }
            targetUri = appendMailOption(uri.toString(), "to", config.get("to"));
            targetUri = appendMailOption(targetUri, "from", config.get("from"));
            if ("smtp".equalsIgnoreCase(scheme) && port == 587) {
                targetUri = appendMailOption(targetUri, "starttls", "true");
            }
            AuthConfiguration auth = request.auth();
            if (auth != null && auth.authType() == AuthType.BASIC) {
                targetUri = appendMailOption(targetUri, "username", auth.username());
                targetUri = appendMailOption(targetUri, "password", auth.password());
            }
        }

        setHeader(exchange, config, "to", "CamelMailTo");
        setHeader(exchange, config, "from", "CamelMailFrom");
        setHeader(exchange, config, "subject", "CamelMailSubject");
        setHeader(exchange, config, "cc", "CamelMailCc");
        setHeader(exchange, config, "bcc", "CamelMailBcc");

        // Allow headers to override configuration values.
        request.headersOrEmpty().forEach((key, value) -> {
            String normalized = key.toLowerCase();
            switch (normalized) {
                case "to" -> exchange.getMessage().setHeader("CamelMailTo", value);
                case "from" -> exchange.getMessage().setHeader("CamelMailFrom", value);
                case "subject" -> exchange.getMessage().setHeader("CamelMailSubject", value);
                case "cc" -> exchange.getMessage().setHeader("CamelMailCc", value);
                case "bcc" -> exchange.getMessage().setHeader("CamelMailBcc", value);
                default -> exchange.getMessage().setHeader(key, value);
            }
        });

        Object contentType = config.get("contentType");
        if (contentType != null) {
            exchange.getMessage().setHeader("CamelMailContentType", normalizeContentType(contentType));
        }

        return targetUri;
    }

    private static String appendMailOption(String uri, String key, Object value) {
        if (value == null) {
            return uri;
        }
        String text = value.toString();
        if (text.isBlank()) {
            return uri;
        }
        String encoded = URLEncoder.encode(text, StandardCharsets.UTF_8);
        return uri + (uri.contains("?") ? "&" : "?") + key + "=" + encoded;
    }

    private static void setHeader(Exchange exchange, Map<String, Object> config, String configKey, String headerName) {
        Object value = config.get(configKey);
        if (value != null) {
            exchange.getMessage().setHeader(headerName, value);
        }
    }

    private static String normalizeContentType(Object contentType) {
        String value = contentType.toString().trim();
        return "text".equalsIgnoreCase(value) ? "text/plain"
            : "html".equalsIgnoreCase(value) ? "text/html" : value;
    }

    private static int parsePort(Object value) {
        if (value == null) {
            return -1;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        String text = value.toString().trim();
        if (text.isBlank()) {
            return -1;
        }
        return Integer.parseInt(text);
    }
}
