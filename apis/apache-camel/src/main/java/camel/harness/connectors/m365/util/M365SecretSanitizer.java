package camel.harness.connectors.m365.util;

import java.util.regex.Pattern;

/**
 * Redacts credential values from exception messages and log lines. All M365 auth
 * secrets pass through this utility before they can reach an exception or a log
 * statement. Microsoft Graph bearer tokens and JWT-shaped secrets are masked.
 */
public final class M365SecretSanitizer {

    private M365SecretSanitizer() {
    }

    private static final String REDACTED = "[REDACTED]";

    /** JWT/JWS shaped tokens (header.payload.signature) and long base64-ish strings. */
    private static final Pattern TOKEN_SHAPE =
        Pattern.compile("\\b[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{20,}\\.[A-Za-z0-9_-]{10,}\\b");
    private static final Pattern LONG_RANDOM =
            Pattern.compile("\\b[A-Za-z0-9_\\-]{40,}\\b");

    /**
     * Returns a sanitized copy of {@code message} with any recognizable secret
     * shape (JWT/bearer tokens, long random strings) replaced.
     */
    public static String sanitize(String message) {
        if (message == null || message.isEmpty()) {
            return message;
        }
        String result = TOKEN_SHAPE.matcher(message).replaceAll(REDACTED);
        result = LONG_RANDOM.matcher(result).replaceAll(REDACTED);
        return result;
    }

    /**
     * Redacts specific secret values (used with clientSecret/accessToken/apiKey)
     * plus any recognizable secret shape in the surrounding text.
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
        return sanitize(result);
    }
}
