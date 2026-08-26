package camel.harness.connectors.m365.auth;

import java.util.Base64;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.env.Environment;

import camel.harness.core.AuthConfiguration;
import camel.harness.core.AuthType;

/**
 * Inspects the {@code idtyp} claim of a Microsoft Graph access token (a JWT) to
 * determine whether the caller is a delegated user ({@code idtyp=user}) or an
 * app-only client ({@code idtyp=app}). This drives whether user-scoped
 * operations may use the {@code /me} shorthand or must be resolved against a
 * specific {@code userId}/{@code userPrincipalName}.
 *
 * <p>Only the JWT payload is decoded (base64url) — the signature is never
 * verified because we merely read claims, not authenticate. Non-JWT tokens
 * (e.g. an API-key gateway token) or undecodable payloads return
 * {@code null}, meaning "cannot determine, fall back to requiring an id".</p>
 */
public final class M365TokenInspector {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private M365TokenInspector() {
    }

    /**
     * Resolves the effective token identity for the given auth block:
     * {@code "user"} for a delegated user token, {@code "app"} for an app-only
     * client-credentials token, or {@code null} when it cannot be determined.
     */
    public static String idTyp(AuthConfiguration auth, Environment env) {
        if (auth != null && auth.authType() != AuthType.NONE) {
            switch (auth.authType()) {
                case BEARER, ACCESS_TOKEN -> {
                    String token = firstNonBlank(auth.token(),
                        env != null ? env.getProperty("m365.auth.token") : null);
                    return decodeIdTyp(token);
                }
                case CLIENT_CREDENTIALS -> {
                    // App-only by definition.
                    return "app";
                }
                case OAUTH2 -> {
                    // Authorization-code flow (refresh token present) acts on behalf of a
                    // user; without a refresh token it falls back to client_credentials.
                    String refresh = firstNonBlank(auth.refreshToken(),
                        env != null ? env.getProperty("m365.auth.refresh-token") : null);
                    return refresh != null ? "user" : "app";
                }
                case AUTHORIZATION_CODE, REFRESH_TOKEN, DEVICE_CODE, ON_BEHALF_OF -> {
                    // All of these flows act on behalf of a signed-in user, so the
                    // /me shorthand is valid.
                    return "user";
                }
                default -> {
                    return null;
                }
            }
        }
        String token = env != null ? env.getProperty("m365.auth.token") : null;
        return decodeIdTyp(token);
    }

    /** Whether the effective token represents a delegated signed-in user. */
    public static boolean isDelegatedUser(AuthConfiguration auth, Environment env) {
        return "user".equals(idTyp(auth, env));
    }

    // ---------------------------------------------------------------------
    // JWT payload decoding
    // ---------------------------------------------------------------------

    private static String decodeIdTyp(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return null;
            }
            byte[] json = Base64.getUrlDecoder().decode(parts[1]);
            JsonNode node = OBJECT_MAPPER.readTree(json);
            String idtyp = node.path("idtyp").asText(null);
            if (idtyp != null && !idtyp.isBlank()) {
                return idtyp;
            }
            // Older tokens may lack idtyp; the scp (scopes) claim indicates a
            // delegated user token rather than an app-only one.
            String scp = node.path("scp").asText(null);
            return (scp != null && !scp.isBlank()) ? "user" : null;
        } catch (Exception e) {
            return null;
        }
    }

    private static String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
    }
}
