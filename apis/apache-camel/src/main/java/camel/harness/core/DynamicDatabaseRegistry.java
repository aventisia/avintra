package camel.harness.core;

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
        dataSource.setJdbcUrl(database.url());
        dataSource.setUsername(database.username());
        dataSource.setPassword(database.password());
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
        if (database == null || database.url() == null || database.url().isBlank()
            || database.username() == null || database.username().isBlank()) {
            throw new IllegalArgumentException("db.url and db.username are required");
        }
        if (!database.url().startsWith("jdbc:")) {
            throw new IllegalArgumentException("db.url must start with jdbc:");
        }
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
