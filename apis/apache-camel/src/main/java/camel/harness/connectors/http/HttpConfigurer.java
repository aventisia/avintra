package camel.harness.connectors.http;

import camel.harness.core.*;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

@Component
public class HttpConfigurer implements ConnectorConfigurer {

    @Override
    public String connectorName() {
        return "http";
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        String targetUri = request.targetUri();
        if (targetUri == null || targetUri.isBlank()) {
            Map<String, Object> config = request.configurationOrEmpty();
            String host = (String) config.get("host");
            if (host == null || host.isBlank()) {
                throw new IllegalArgumentException("HTTP host is required in configuration.host or targetUri");
            }
            StringBuilder uri = new StringBuilder();
            if (host.startsWith("http://") || host.startsWith("https://")) {
                String scheme = host.startsWith("https://") ? "https:" : "http:";
                String remainder = host.substring(host.indexOf(":") + 1);
                uri.append(scheme).append(remainder);
            } else {
                uri.append("http://").append(host);
            }
            String path = (String) config.get("path");
            if (path != null && !path.isBlank()) {
                uri.append("/").append(path.replaceFirst("^/+", ""));
            }
            targetUri = uri.toString();
        }

        AuthConfiguration auth = request.auth();
        if (auth != null) {
            switch (auth.authType()) {
                case BASIC -> {
                    if (auth.username() != null) {
                        exchange.getMessage().setHeader("Authorization",
                            "Basic " + encodeBasic(auth.username(), auth.password()));
                    }
                }
                case BEARER -> {
                    if (auth.token() != null) {
                        exchange.getMessage().setHeader("Authorization", "Bearer " + auth.token());
                    }
                }
                case API_KEY -> {
                    if (auth.apiKey() != null) {
                        exchange.getMessage().setHeader(
                            auth.apiKeyHeader() != null ? auth.apiKeyHeader() : "X-Api-Key", auth.apiKey());
                    }
                }
                default -> {
                    // no-op
                }
            }
        }

        String httpMethod = (String) request.configurationOrEmpty().get("httpMethod");
        if (httpMethod != null && !httpMethod.isBlank()) {
            exchange.getMessage().setHeader(Exchange.HTTP_METHOD, httpMethod);
        }
        return targetUri;
    }

    private static String encodeBasic(String username, String password) {
        String value = username + ":" + (password != null ? password : "");
        return java.util.Base64.getEncoder().encodeToString(value.getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }
}
