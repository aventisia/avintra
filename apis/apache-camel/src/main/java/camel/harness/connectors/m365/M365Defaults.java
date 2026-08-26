package camel.harness.connectors.m365;

import org.springframework.core.env.Environment;

/**
 * Resolves M365 connector defaults from Spring environment properties
 * ({@code m365.base-url}, {@code m365.token-url}) with sane Microsoft Graph
 * defaults. Mirror of the GitHub connector's {@code github.base-url} handling;
 * credentials are never held here.
 */
public final class M365Defaults {

    public static final String DEFAULT_BASE_URL = "https://graph.microsoft.com/v1.0";
    public static final String DEFAULT_TOKEN_URL_TEMPLATE =
            "https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token";

    private M365Defaults() {
    }

    public static String baseUrl(Environment environment) {
        if (environment != null) {
            String value = environment.getProperty("m365.base-url");
            if (value != null && !value.isBlank()) {
                return stripTrailingSlash(value);
            }
        }
        return DEFAULT_BASE_URL;
    }

    public static String tokenUrl(Environment environment) {
        if (environment != null) {
            String value = environment.getProperty("m365.token-url");
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return DEFAULT_TOKEN_URL_TEMPLATE;
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }
}
