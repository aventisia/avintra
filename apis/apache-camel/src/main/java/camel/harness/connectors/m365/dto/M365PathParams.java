package camel.harness.connectors.m365.dto;

import camel.harness.connectors.m365.auth.M365TokenInspector;
import camel.harness.connectors.m365.error.M365Exception;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.core.env.Environment;

import camel.harness.core.AuthConfiguration;

/**
 * Shared path-parameter resolution for the M365 connector. Centralizes the
 * {@code userId} / {@code userPrincipalName} alias and the delegated-token
 * {@code /me} fallback so the generic dispatcher and every domain service
 * behave identically.
 */
public final class M365PathParams {

    private M365PathParams() {
    }

    /**
     * Resolves the user-scoped path segment for the caller: {@code "users/<id>"}
     * when {@code userId} or {@code userPrincipalName} is configured, or
     * {@code "me"} when the token is a delegated user token and no id was given.
     *
     * @param config the request configuration map
     * @param auth   the auth block
     * @param env    Spring environment (may be null)
     * @param what   label describing the operation for error messages
     */
    public static String userSegment(Map<String, Object> config, AuthConfiguration auth,
            Environment env, String what) {
        String id = firstNonBlank(configValue(config, "userId"),
            configValue(config, "userPrincipalName"));
        if (id != null) {
            return "users/" + urlEncode(id);
        }
        if (M365TokenInspector.isDelegatedUser(auth, env)) {
            return "me";
        }
        throw new M365Exception(
            what + " requires configuration.userId or configuration.userPrincipalName "
                + "(client_credentials/app-only tokens cannot use /me)", 400);
    }

    /** Resolves the raw user id (no URL encoding) or throws when absent. */
    public static String userId(Map<String, Object> config, String what) {
        String id = firstNonBlank(configValue(config, "userId"),
            configValue(config, "userPrincipalName"));
        if (id == null) {
            throw new M365Exception(what + " requires configuration.userId or configuration.userPrincipalName", 400);
        }
        return id;
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private static String configValue(Map<String, Object> config, String key) {
        Object value = config.get(key);
        return value == null ? null : String.valueOf(value);
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
