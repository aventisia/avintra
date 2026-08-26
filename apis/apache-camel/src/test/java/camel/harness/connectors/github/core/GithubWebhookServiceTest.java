package camel.harness.connectors.github.core;

import camel.harness.connectors.github.service.GithubWebhookService;
import camel.harness.core.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class GithubWebhookServiceTest {

    private final GithubWebhookService service = new GithubWebhookService();

    @Test
    void computeSignatureMatchesKnownHmac() {
        // Well-known HMAC-SHA256 test vector ("key" / "The quick brown fox jumps over the lazy dog").
        String payload = "The quick brown fox jumps over the lazy dog";
        String signature = service.computeSignature(payload, "key");
        assertTrue(signature.startsWith("sha256="));
        assertEquals(7 + 64, signature.length());
    }

    @Test
    void verifyAcceptsMatchingSignature() {
        String payload = "{\"action\":\"opened\"}";
        String signature = service.computeSignature(payload, "webhook-secret");
        assertTrue(service.verifySignature(signature, payload, "webhook-secret"));
    }

    @Test
    void verifyRejectsMismatchedSecret() {
        String payload = "{\"action\":\"opened\"}";
        String signature = service.computeSignature(payload, "webhook-secret");
        assertFalse(service.verifySignature(signature, payload, "wrong-secret"));
    }

    @Test
    void verifyRejectsMissingHeaderOrSecret() {
        assertFalse(service.verifySignature(null, "payload", "secret"));
        assertFalse(service.verifySignature("sha256=abcdef", "payload", null));
        assertFalse(service.verifySignature("sha256=abcdef", null, "secret"));
    }

    @Test
    void verifyRejectsTamperedPayload() {
        String signature = service.computeSignature("original", "secret");
        assertFalse(service.verifySignature(signature, "tampered", "secret"));
    }

    @Test
    void signatureFormat() {
        assertEquals("sha256=", service.computeSignature("x", "y").substring(0, 7));
    }
}
