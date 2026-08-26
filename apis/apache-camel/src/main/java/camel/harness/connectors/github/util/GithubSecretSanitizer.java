package camel.harness.connectors.github.util;

import camel.harness.core.*;
import java.util.regex.Pattern;

/**
 * Redacts credential values from exception messages and log lines. All GitHub
 * auth secrets pass through this utility before they can reach an exception or
 * a log statement.
 */
public final class GithubSecretSanitizer {

    private GithubSecretSanitizer() {
    }

    private static final String REDACTED = "[REDACTED]";

    /**
     * Returns a sanitized copy of {@code message} with any known secret values
     * replaced. Unknown values are protected by also masking GitHub-style token
     * shapes (ghp_*, gho_*, ghu_*, ghs_*, ghr_* and long hex strings).
     */
    public static String sanitize(String message) {
        if (message == null || message.isEmpty()) {
            return message;
        }
        return maskTokenShapes(message);
    }

    /** Masks recognizable GitHub token prefixes and long hex/random strings. */
    private static String maskTokenShapes(String text) {
        String result = text.replaceAll("(?i)\\b(gh[pousr]_[A-Za-z0-9]{20,})\\b", REDACTED);
        result = result.replaceAll("\\b[0-9a-fA-F]{40,}\\b", REDACTED);
        return result;
    }

    /**
     * Redacts a specific secret value (used with token/clientSecret/apiKey) plus
     * any GitHub-style token shape in the surrounding text.
     */
    public static String sanitize(String text, String... secrets) {
        if (text == null || text.isEmpty()) {
            return text;
        }
        String result = text;
        if (secrets != null) {
            for (String secret : secrets) {
                if (secret != null && !secret.isEmpty()) {
                    result = result.replace(secret, REDACTED);
                }
            }
        }
        return maskTokenShapes(result);
    }
}
