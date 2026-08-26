package camel.harness.connectors.github.service;

import camel.harness.connectors.github.error.GithubException;
import camel.harness.core.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.stereotype.Component;

/**
 * GitHub webhook helpers. The harness is producer-only, so "webhook event"
 * actions are handled locally: {@code receive} stores the event, {@code verify}
 * validates the {@code X-Hub-Signature-256} HMAC, and {@code route-event}
 * dispatches the event by its {@code X-GitHub-Event} header.
 *
 * <p>Secrets (the webhook secret) are never logged or echoed in responses.</p>
 */
@Component
public class GithubWebhookService {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final String SIGNATURE_PREFIX = "sha256=";

    /**
     * Verifies the {@code X-Hub-Signature-256} header of a webhook delivery.
     *
     * @param signatureHeader raw value of {@code X-Hub-Signature-256}, may be null
     * @param payload        raw request body
     * @param secret         configured webhook secret
     * @return true when the signature matches, false when missing/mismatched
     */
    public boolean verifySignature(String signatureHeader, String payload, String secret) {
        if (secret == null || secret.isEmpty() || payload == null) {
            return false;
        }
        if (signatureHeader == null || !signatureHeader.startsWith(SIGNATURE_PREFIX)) {
            return false;
        }
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            byte[] expected = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            String expectedHex = hexEncode(expected);
            String provided = signatureHeader.substring(SIGNATURE_PREFIX.length());
            return MessageDigest.isEqual(expectedHex.getBytes(StandardCharsets.UTF_8),
                provided.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            return false;
        }
    }

    /** Computes the {@code sha256=<hex>} signature for a payload + secret. */
    public String computeSignature(String payload, String secret) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256));
            return SIGNATURE_PREFIX + hexEncode(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new GithubException("Failed to compute webhook signature", 500);
        }
    }

    private static String hexEncode(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(Character.forDigit((b >> 4) & 0xF, 16)).append(Character.forDigit(b & 0xF, 16));
        }
        return sb.toString();
    }
}
