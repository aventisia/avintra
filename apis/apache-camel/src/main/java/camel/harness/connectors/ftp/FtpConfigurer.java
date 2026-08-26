package camel.harness.connectors.ftp;

import camel.harness.core.*;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

@Component
public class FtpConfigurer implements ConnectorConfigurer {

    @Override
    public String connectorName() {
        return "ftp";
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        Map<String, Object> config = request.configurationOrEmpty();
        String scheme = (String) config.getOrDefault("scheme", "ftp");
        String host = (String) config.get("host");
        String directory = (String) config.get("directoryName");
        if (host == null || host.isBlank()) {
            throw new IllegalArgumentException("FTP host is required in configuration.host");
        }
        if (directory == null || directory.isBlank()) {
            throw new IllegalArgumentException("FTP directoryName is required in configuration.directoryName");
        }

        StringBuilder uri = new StringBuilder(scheme).append("://").append(host);
        Object port = config.get("port");
        if (port != null) {
            uri.append(":").append(port);
        }
        uri.append("/").append(directory.replaceFirst("^/+", ""));

        AuthConfiguration auth = request.auth();
        if (auth != null && auth.authType() == AuthType.BASIC) {
            if (auth.username() != null) {
                uri.append("?username=").append(escape(auth.username()));
                if (auth.password() != null) {
                    uri.append("&password=").append(escape(auth.password()));
                }
            }
        }

        String fileName = (String) config.get("fileName");
        if (fileName != null && !fileName.isBlank()) {
            uri.append(uri.indexOf("?") > 0 ? "&" : "?").append("fileName=").append(escape(fileName));
        }

        // Optional configuration options passed through to the Camel URI.
        appendBooleanOption(uri, "passiveMode", config.get("passiveMode"));
        appendBooleanOption(uri, "binary", config.get("binary"));
        appendBooleanOption(uri, "strictHostKeyChecking", config.get("strictHostKeyChecking"));

        // Consumer-style operations need consumer-friendly options.
        // read: default consumer (no delete, no noop) so the same file can be read repeatedly.
        // list/check: noop=true keeps files intact; a fresh idempotent repo is added per request in the route.
        // delete: delete=true removes the file after consuming it.
        String operation = request.operationName();
        if (operation != null && !operation.isBlank()) {
            switch (operation.toLowerCase()) {
                case "list", "check" -> appendOption(uri, "noop=true");
                case "delete" -> appendOption(uri, "delete=true");
                case "read" -> { /* default consumer options */ }
                case "append" -> {
                    // appendPosition controls where the payload is inserted:
                    //   end (default) -> fileExist=Append (producer dispatch)
                    //   start or a numeric offset -> read-modify-write handled in the route
                    Object pos = config.get("appendPosition");
                    String position = pos == null ? "end" : pos.toString().trim().toLowerCase();
                    if ("end".equals(position) || position.isEmpty()) {
                        appendOption(uri, "fileExist=Append");
                    } else {
                        appendOption(uri, "idempotent=false");
                        appendOption(uri, "maxMessagesPerPoll=1");
                    }
                }
                default -> { /* producer operations: write */ }
            }
            if ("read".equalsIgnoreCase(operation) || "delete".equalsIgnoreCase(operation)) {
                // Disable the idempotent repository so the same file can be read/deleted
                // repeatedly across separate requests.
                appendOption(uri, "idempotent=false");
                appendOption(uri, "maxMessagesPerPoll=1");
            }
        }
        return uri.toString();
    }

    private static void appendOption(StringBuilder uri, String option) {
        uri.append(uri.indexOf("?") > 0 ? "&" : "?").append(option);
    }

    private static void appendBooleanOption(StringBuilder uri, String name, Object value) {
        if (value == null) {
            return;
        }
        String text = value instanceof Boolean b ? b.toString() : value.toString();
        appendOption(uri, name + "=" + text);
    }

    private static String escape(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
