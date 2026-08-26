package camel.harness.connectors.m365.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.auth.M365TokenInspector;
import camel.harness.connectors.m365.dto.M365PathParams;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.core.AuthConfiguration;

/**
 * Tests for {@link M365TokenInspector} (JWT {@code idtyp} decoding) and
 * {@link M365PathParams} (userId/userPrincipalName alias + /me routing).
 */
class M365TokenInspectorTest {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    // ------------------------------------------------------------------
    // Token inspector
    // ------------------------------------------------------------------

    @Test
    void delegatedTokenIdTypUser() throws Exception {
        String token = jwt("idtyp", "user");
        AuthConfiguration auth = new AuthConfiguration("accessToken", null, null, token, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        assertEquals("user", M365TokenInspector.idTyp(auth, null));
        assertTrue(M365TokenInspector.isDelegatedUser(auth, null));
    }

    @Test
    void appTokenIdTypApp() throws Exception {
        String token = jwt("idtyp", "app");
        AuthConfiguration auth = new AuthConfiguration("accessToken", null, null, token, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        assertEquals("app", M365TokenInspector.idTyp(auth, null));
        assertFalse(M365TokenInspector.isDelegatedUser(auth, null));
    }

    @Test
    void clientCredentialsIsAlwaysApp() {
        AuthConfiguration auth = new AuthConfiguration("client_credentials", null, null, null, null, null,
            "cid", "secret", null, null, null, "tenant", null, null, null, null, null, null, null);
        assertEquals("app", M365TokenInspector.idTyp(auth, null));
    }

    @Test
    void oauth2WithRefreshTokenIsUser() {
        AuthConfiguration auth = new AuthConfiguration("oauth2", null, null, null, null, null,
            "cid", "secret", null, null, null, "tenant", null, null, "refresh", null, null, null, null);
        assertEquals("user", M365TokenInspector.idTyp(auth, null));
    }

    @Test
    void oauth2WithoutRefreshTokenIsApp() {
        AuthConfiguration auth = new AuthConfiguration("oauth2", null, null, null, null, null,
            "cid", "secret", null, null, null, "tenant", null, null, null, null, null, null, null);
        assertEquals("app", M365TokenInspector.idTyp(auth, null));
    }

    @Test
    void authorizationCodeIsUser() {
        AuthConfiguration auth = new AuthConfiguration("authorization_code", null, null, null, null, null,
            "cid", "secret", null, null, null, "tenant", null, null, null, null, null, null, null,
            "code", "http://localhost/callback", null, null);
        assertEquals("user", M365TokenInspector.idTyp(auth, null));
        assertTrue(M365TokenInspector.isDelegatedUser(auth, null));
    }

    @Test
    void refreshTokenIsUser() {
        AuthConfiguration auth = new AuthConfiguration("refresh_token", null, null, null, null, null,
            "cid", "secret", null, null, null, "tenant", null, null, "refresh", null, null, null, null,
            null, null, null, null);
        assertEquals("user", M365TokenInspector.idTyp(auth, null));
    }

    @Test
    void deviceCodeIsUser() {
        AuthConfiguration auth = new AuthConfiguration("device_code", null, null, null, null, null,
            "cid", "secret", null, null, null, "tenant", null, null, null, null, null, null, null,
            null, null, "dev-code", null);
        assertEquals("user", M365TokenInspector.idTyp(auth, null));
    }

    @Test
    void onBehalfOfIsUser() {
        AuthConfiguration auth = new AuthConfiguration("on_behalf_of", null, null, null, null, null,
            "cid", "secret", null, null, null, "tenant", null, null, null, null, null, null, null,
            null, null, null, "caller-jwt");
        assertEquals("user", M365TokenInspector.idTyp(auth, null));
    }

    @Test
    void scpClaimInfersUser() throws Exception {
        String token = jwtWithClaims(Map.of("scp", "Mail.Read User.Read"));
        AuthConfiguration auth = new AuthConfiguration("accessToken", null, null, token, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        assertEquals("user", M365TokenInspector.idTyp(auth, null));
    }

    @Test
    void nonJwtTokenReturnsNull() {
        AuthConfiguration auth = new AuthConfiguration("accessToken", null, null, "not-a-jwt", null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        assertNull(M365TokenInspector.idTyp(auth, null));
    }

    // ------------------------------------------------------------------
    // Path params: userId / userPrincipalName alias + /me routing
    // ------------------------------------------------------------------

    @Test
    void userSegmentPrefersUserId() {
        assertEquals("users/alex%40contoso.com", M365PathParams.userSegment(
            Map.of("userId", "alex@contoso.com"), null, null, "op"));
    }

    @Test
    void userSegmentAcceptsUserPrincipalNameAlias() {
        assertEquals("users/alex%40contoso.com", M365PathParams.userSegment(
            Map.of("userPrincipalName", "alex@contoso.com"), null, null, "op"));
    }

    @Test
    void userSegmentUsesMeForDelegatedToken() throws Exception {
        String token = jwt("idtyp", "user");
        AuthConfiguration auth = new AuthConfiguration("accessToken", null, null, token, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
        assertEquals("me", M365PathParams.userSegment(Map.of(), auth, null, "mail.list"));
    }

    @Test
    void userSegmentRequiresIdForAppToken() {
        AuthConfiguration auth = new AuthConfiguration("client_credentials", null, null, null, null, null,
            "cid", "secret", null, null, null, "tenant", null, null, null, null, null, null, null);
        M365Exception ex = org.junit.jupiter.api.Assertions.assertThrows(M365Exception.class,
            () -> M365PathParams.userSegment(Map.of(), auth, null, "mail.list"));
        assertEquals(400, ex.statusCode());
        assertTrue(ex.getMessage().contains("userPrincipalName"));
    }

    @Test
    void userIdThrowsWhenAbsent() {
        M365Exception ex = org.junit.jupiter.api.Assertions.assertThrows(M365Exception.class,
            () -> M365PathParams.userId(Map.of(), "user.assign-license"));
        assertEquals(400, ex.statusCode());
        assertTrue(ex.getMessage().contains("userPrincipalName"));
    }

    @Test
    void userIdAcceptsAlias() {
        assertEquals("alex@contoso.com", M365PathParams.userId(
            Map.of("userPrincipalName", "alex@contoso.com"), "op"));
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private static String jwt(String claim, String value) throws Exception {
        return jwtWithClaims(Map.of(claim, value));
    }

    private static String jwtWithClaims(Map<String, Object> claims) throws Exception {
        String header = b64("{\"alg\":\"none\",\"typ\":\"JWT\"}");
        String payload = b64(MAPPER.writeValueAsString(claims));
        return header + "." + payload + ".sig";
    }

    private static String b64(String json) {
        return Base64.getUrlEncoder().withoutPadding()
            .encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }
}
