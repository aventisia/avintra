package camel.harness.core;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

/**
 * Fallback configurer for any Camel component that does not have a hand-written
 * configurer. It builds the URI from configuration fields and injects auth options.
 */
@Component
public class GenericConfigurer implements ConnectorConfigurer {

    /** Wildcard connector name used as a fallback for any unhandled Camel component. */
    public static final String GENERIC_CONNECTOR = "*";

    @Override
    public String connectorName() {
        return GENERIC_CONNECTOR;
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        String targetUri = request.targetUri();
        if (targetUri != null && !targetUri.isBlank()) {
            return targetUri;
        }

        Map<String, Object> config = request.configurationOrEmpty();
        String scheme = metadata.schemes().isEmpty() ? request.connectorName(null) : metadata.schemes().get(0);
        if (scheme == null || scheme.isBlank()) {
            throw new IllegalArgumentException("Cannot determine URI scheme for connector");
        }

        StringBuilder uri = new StringBuilder(scheme).append(":");
        if (config.containsKey("host") && config.get("host") instanceof String host && !host.isBlank()) {
            uri.append("//").append(host);
        }
        if (config.containsKey("directoryName") && config.get("directoryName") instanceof String dir && !dir.isBlank()) {
            uri.append(dir.startsWith("/") ? dir : "/" + dir);
        }
        if (config.containsKey("topic") && config.get("topic") instanceof String topic && !topic.isBlank()) {
            uri.append(topic);
        }
        if (config.containsKey("destinationName") && config.get("destinationName") instanceof String dest && !dest.isBlank()) {
            uri.append(dest);
        }
        if (config.containsKey("query") && config.get("query") instanceof String query && !query.isBlank()) {
            uri.append(query);
        }

        String baseUri = uri.toString();
        String queryString = buildQuery(config);
        if (!queryString.isBlank()) {
            baseUri += (baseUri.contains("?") ? "&" : "?") + queryString;
        }

        return applyAuth(baseUri, request.auth());
    }

    private static String buildQuery(Map<String, Object> config) {
        StringBuilder query = new StringBuilder();
        for (Map.Entry<String, Object> entry : config.entrySet()) {
            String key = entry.getKey();
            Object value = entry.getValue();
            if (value == null
                || "host".equals(key) || "scheme".equals(key)
                || "directoryName".equals(key) || "topic".equals(key)
                || "destinationName".equals(key) || "query".equals(key)) {
                continue;
            }
            if (!query.isEmpty()) {
                query.append("&");
            }
            query.append(key).append("=").append(escape(value.toString()));
        }
        return query.toString();
    }

    private static String applyAuth(String uri, AuthConfiguration auth) {
        if (auth == null || auth.authType() == AuthType.NONE) {
            return uri;
        }
        StringBuilder options = new StringBuilder();
        switch (auth.authType()) {
            case BASIC -> {
                appendOption(options, "username", auth.username());
                appendOption(options, "password", auth.password());
            }
            case BEARER -> {
                appendOption(options, "accessToken", auth.token());
            }
            case API_KEY -> {
                if (auth.apiKey() != null) {
                    String header = auth.apiKeyHeader() != null ? auth.apiKeyHeader() : "X-Api-Key";
                    appendOption(options, header, auth.apiKey());
                }
            }
            case CLIENT_CREDENTIALS -> {
                appendOption(options, "clientId", auth.clientId());
                appendOption(options, "clientSecret", auth.clientSecret());
            }
            case AWS -> {
                appendOption(options, "accessKey", auth.accessKey());
                appendOption(options, "secretKey", auth.secretKey());
                appendOption(options, "region", auth.region());
            }
            case AZURE -> {
                appendOption(options, "tenantId", auth.tenantId());
                appendOption(options, "clientId", auth.clientId());
                appendOption(options, "clientSecret", auth.clientSecret());
                appendOption(options, "subscriptionId", auth.subscriptionId());
            }
            case GCP -> {
                appendOption(options, "projectId", auth.projectId());
                appendOption(options, "serviceAccountKey", auth.token());
            }
            case DATABASE -> {
                appendOption(options, "dataSourceUrl", auth.properties() != null ? auth.properties().get("url") : null);
                appendOption(options, "dataSourceUser", auth.properties() != null ? auth.properties().get("username") : null);
                appendOption(options, "dataSourcePassword", auth.properties() != null ? auth.properties().get("password") : null);
            }
            default -> {
                // no-op
            }
        }
        if (auth.properties() != null) {
            auth.properties().forEach((k, v) -> appendOption(options, k, v));
        }
        if (options.isEmpty()) {
            return uri;
        }
        return uri + (uri.contains("?") ? "&" : "?") + options;
    }

    private static void appendOption(StringBuilder builder, String key, String value) {
        if (key == null || value == null) {
            return;
        }
        if (!builder.isEmpty()) {
            builder.append("&");
        }
        builder.append(key).append("=").append(escape(value));
    }

    private static String escape(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
