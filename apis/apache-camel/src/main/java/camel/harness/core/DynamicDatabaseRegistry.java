package camel.harness.core;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.zaxxer.hikari.HikariDataSource;
import org.apache.camel.CamelContext;
import org.springframework.stereotype.Component;

@Component
public class DynamicDatabaseRegistry {
    private final Map<String, HikariDataSource> dataSources = new ConcurrentHashMap<>();

    /**
     * Register a pooled DataSource for the given database in the CamelContext
     * registry and rewrite the target URI to reference it via the dataSource option.
     */
    public String bindDataSource(CamelContext context, DatabaseConfig database, String targetUri) {
        validate(database);
        String beanName = "requestDataSource_" + fingerprint(database);
        HikariDataSource dataSource = dataSources.computeIfAbsent(beanName, ignored -> create(database));
        context.getRegistry().bind(beanName, dataSource);
        return withDataSourceOption(targetUri, beanName);
    }

    private static HikariDataSource create(DatabaseConfig database) {
        HikariDataSource dataSource = new HikariDataSource();
        // Credentials may be embedded in the connection string URL
        // (postgresql://user:pass@host:port/db). When not supplied separately,
        // extract them from the URL userinfo. Percent-encoded characters in the
        // userinfo (e.g. %40 for '@') are decoded so the driver receives the
        // literal credential value.
        String username = database.username();
        String password = database.password();
        String[] userInfo = extractUserInfo(database.url());
        if (userInfo != null) {
            if (isBlank(username)) {
                username = decodeUserInfo(userInfo[0]);
            }
            if (isBlank(password)) {
                password = decodeUserInfo(userInfo[1]);
            }
        }
        // The userinfo must be stripped from the JDBC URL before the driver sees
        // it: the driver parses the URL itself and would otherwise treat
        // "user:pass@host" as the host when the password contains reserved
        // characters such as '@' (e.g. postgres:Post@123@localhost), producing
        // UnknownHostException. Credentials are supplied separately below.
        dataSource.setJdbcUrl(stripUserInfo(normalizeUrl(database.url())));
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setMaximumPoolSize(5);
        dataSource.setPoolName("camel-" + fingerprint(database));
        return dataSource;
    }

    private static String withDataSourceOption(String targetUri, String beanName) {
        String option = "dataSource=#" + beanName;
        int queryStart = targetUri.indexOf('?');
        if (queryStart < 0) {
            return targetUri + "?" + option;
        }
        String prefix = targetUri.substring(0, queryStart + 1);
        String query = targetUri.substring(queryStart + 1);
        if (query.matches(".*(^|&)dataSource=[^&]*.*")) {
            return prefix + query.replaceFirst("(^|&)dataSource=[^&]*", "$1" + option);
        }
        return targetUri + "&" + option;
    }

    private static void validate(DatabaseConfig database) {
        if (database == null || database.url() == null || database.url().isBlank()) {
            throw new IllegalArgumentException("db.url is required");
        }
        String url = normalizeUrl(database.url());
        if (!url.startsWith("jdbc:")) {
            throw new IllegalArgumentException("db.url must start with jdbc: or postgresql:");
        }
        // A username is required unless it is embedded in the URL userinfo.
        if (isBlank(database.username()) && extractUserInfo(database.url()) == null) {
            throw new IllegalArgumentException("db.username is required (or embed it in the connection string URL)");
        }
    }

    /**
     * Normalize a URL-style PostgreSQL connection string to the JDBC URL the
     * driver expects. Accepts both {@code postgresql://...} and
     * {@code jdbc:postgresql://...}; the former is rewritten to the latter.
     */
    private static String normalizeUrl(String url) {
        if (url == null) {
            return null;
        }
        String trimmed = url.trim();
        if (trimmed.startsWith("postgresql://")) {
            return "jdbc:" + trimmed;
        }
        return trimmed;
    }

    /**
     * Remove the userinfo component from a URL
     * ({@code postgresql://user:pass@host:port/db} -> {@code postgresql://host:port/db}).
     * Splits on the LAST {@code @} so passwords containing {@code @} are handled
     * correctly. Returns the URL unchanged when it has no userinfo.
     */
    private static String stripUserInfo(String url) {
        if (url == null) {
            return null;
        }
        int schemeEnd = url.indexOf("://");
        if (schemeEnd < 0) {
            return url;
        }
        int at = url.lastIndexOf('@');
        if (at < 0 || at < schemeEnd) {
            return url;
        }
        return url.substring(0, schemeEnd + 3) + url.substring(at + 1);
    }

    /**
     * Extract {@code [username, password]} from a URL's userinfo component
     * ({@code postgresql://user:pass@host:port/db}). Splits on the LAST {@code @}
     * so passwords containing {@code @} are handled correctly. Returns
     * {@code null} when the URL has no userinfo.
     */
    private static String[] extractUserInfo(String url) {
        if (url == null) {
            return null;
        }
        int schemeEnd = url.indexOf("://");
        if (schemeEnd < 0) {
            return null;
        }
        int at = url.lastIndexOf('@');
        if (at < 0 || at < schemeEnd) {
            return null;
        }
        String userInfo = url.substring(schemeEnd + 3, at);
        int colon = userInfo.indexOf(':');
        String username = colon < 0 ? userInfo : userInfo.substring(0, colon);
        String password = colon < 0 ? "" : userInfo.substring(colon + 1);
        if (username.isEmpty()) {
            return null;
        }
        return new String[] { username, password };
    }

    /**
     * Percent-decode a credential extracted from the URL userinfo. Connection
     * strings may encode reserved characters (e.g. {@code %40} for {@code @},
     * {@code %25} for {@code %}) so the driver receives the literal value.
     * Malformed sequences are left as-is.
     */
    private static String decodeUserInfo(String value) {
        if (value == null || value.indexOf('%') < 0) {
            return value;
        }
        ByteArrayOutputStream out = new ByteArrayOutputStream(value.length());
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (c == '%' && i + 2 < value.length()) {
                int hi = Character.digit(value.charAt(i + 1), 16);
                int lo = Character.digit(value.charAt(i + 2), 16);
                if (hi >= 0 && lo >= 0) {
                    out.write((hi << 4) | lo);
                    i += 2;
                    continue;
                }
            }
            byte[] bytes = String.valueOf(c).getBytes(StandardCharsets.UTF_8);
            out.write(bytes, 0, bytes.length);
        }
        return out.toString(StandardCharsets.UTF_8);
    }

    private static boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private static String fingerprint(DatabaseConfig database) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                .digest((database.url() + "\n" + database.username() + "\n" + database.password())
                    .getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte value : digest) {
                result.append(String.format("%02x", value));
            }
            return result.substring(0, 16);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }
}
