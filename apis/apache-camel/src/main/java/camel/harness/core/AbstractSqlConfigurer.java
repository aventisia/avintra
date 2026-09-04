package camel.harness.core;

import java.util.Map;

import java.nio.charset.StandardCharsets;

import org.apache.camel.Exchange;

public abstract class AbstractSqlConfigurer implements ConnectorConfigurer {

    private final DynamicDatabaseRegistry databaseRegistry;

    protected AbstractSqlConfigurer(DynamicDatabaseRegistry databaseRegistry) {
        this.databaseRegistry = databaseRegistry;
    }

    @Override
    public String resolveEndpoint(Exchange exchange, ConnectorRequest request, ConnectorMetadata metadata) {
        Map<String, Object> config = request.configurationOrEmpty();
        String query = (String) config.get("query");
        String dataSourceName = (String) config.get("dataSourceName");

        StringBuilder uri = new StringBuilder("sql:");
        if (query != null && !query.isBlank()) {
            uri.append(encodeSql(query));
        } else {
            throw new IllegalArgumentException("SQL query is required in configuration.query");
        }

        AuthConfiguration auth = request.auth();
        if (auth != null && auth.authType() == AuthType.DATABASE) {
            Map<String, String> props = auth.properties();
            if (props == null) {
                throw new IllegalArgumentException("auth.properties is required for auth.type=database");
            }
            DatabaseConfig database = new DatabaseConfig(
                    props.get("url"),
                    props.get("username"),
                    props.get("password"));
            String baseUri = uri.toString();
            return databaseRegistry.bindDataSource(exchange.getContext(), database, baseUri);
        }

        // Fallback to legacy db block
        if (request.db() != null) {
            return databaseRegistry.bindDataSource(exchange.getContext(), request.db(), uri.toString());
        }

        if (dataSourceName != null && !dataSourceName.isBlank()) {
            uri.append("?dataSource=#").append(dataSourceName);
        }
        return uri.toString();
    }

    /**
     * Camel SQL endpoint URIs keep the query in the path segment, so we only
     * escape characters that would be parsed as URI option separators or that
     * break path parsing (space and plus).
     */
    private static String encodeSql(String query) {
        byte[] bytes = query.getBytes(StandardCharsets.UTF_8);
        StringBuilder encoded = new StringBuilder(bytes.length);
        for (byte b : bytes) {
            int c = b & 0xFF;
            // Percent-encode characters that would be parsed as URI option
            // separators or break path parsing (space, plus, ?, &, #, %), plus
            // any non-ASCII byte so multi-byte UTF-8 (e.g. 日本語) survives the
            // URI round-trip instead of being rejected by the endpoint parser.
            if (c == ' ' || c == '+' || c == '?' || c == '&' || c == '#' || c == '%' || c > 127) {
                encoded.append(String.format("%%%02X", c));
            } else {
                encoded.append((char) c);
            }
        }
        return encoded.toString();
    }
}
