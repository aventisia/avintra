package camel.harness.connectors.github.core;

import camel.harness.connectors.github.util.GithubSecretSanitizer;
import camel.harness.core.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class GithubSecretSanitizerTest {

    @Test
    void masksKnownGitHubTokenShapes() {
        String message = "Unauthorized for ghp_abcdefghijklmnopqrstuvwxyz123456 and gho_zyxwvutsrqponmlkjihgfedcba654321";
        String sanitized = GithubSecretSanitizer.sanitize(message);
        assertFalse(sanitized.contains("ghp_abcdefghijklmnopqrstuvwxyz123456"));
        assertFalse(sanitized.contains("gho_zyxwvutsrqponmlkjihgfedcba654321"));
        assertTrue(sanitized.contains("[REDACTED]"));
    }

    @Test
    void masksLongHexStrings() {
        String hex = "3f7a9c1e2b4d5f608192a3b4c5d6e7f8091a2b3c4";
        assertNotEquals(hex, GithubSecretSanitizer.sanitize("token was " + hex));
    }

    @Test
    void redactsProvidedSecretsExplicitly() {
        String token = "my-custom-super-secret-token";
        String sanitized = GithubSecretSanitizer.sanitize(
            "Authenticating with " + token + " failed", token);
        assertFalse(sanitized.contains(token));
        assertTrue(sanitized.contains("[REDACTED]"));
    }

    @Test
    void nullAndEmptyAreSafe() {
        assertEquals(null, GithubSecretSanitizer.sanitize(null));
        assertEquals("", GithubSecretSanitizer.sanitize(""));
    }

    @Test
    void plainMessagesPassThroughUnchanged() {
        String message = "GitHub API error HTTP 404: Not Found";
        assertEquals(message, GithubSecretSanitizer.sanitize(message));
    }
}
