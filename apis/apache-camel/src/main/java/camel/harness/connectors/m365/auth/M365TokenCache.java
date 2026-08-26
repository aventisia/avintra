package camel.harness.connectors.m365.auth;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * In-memory cache of Microsoft Entra ID OAuth2 access tokens keyed by a stable
 * client identity (tenantId + clientId + tokenUrl + scopes). Thread-safe; tokens
 * are refreshed lazily by {@link M365AuthService} when expired or when Graph
 * returns 401.
 *
 * <p>Deliberately in-memory and single-node: matches the harness's single-process
 * test-harness scope. Secrets never leave this component except through the auth
 * service, and are never logged.</p>
 */
@Component
public class M365TokenCache {

    private static final long MARGIN_SECONDS = 60;

    private record CachedToken(String accessToken, String refreshToken, Instant expiresAt) {
        boolean valid() {
            return accessToken != null
                && (expiresAt == null || Instant.now().isBefore(expiresAt.minusSeconds(MARGIN_SECONDS)));
        }
    }

    private final Map<String, CachedToken> cache = new ConcurrentHashMap<>();

    public void put(String key, String accessToken, String refreshToken, Long expiresInSeconds) {
        Instant expiresAt = expiresInSeconds == null ? null : Instant.now().plusSeconds(expiresInSeconds);
        cache.put(key, new CachedToken(accessToken, refreshToken, expiresAt));
    }

    public String accessToken(String key) {
        CachedToken entry = cache.get(key);
        return entry != null && entry.valid() ? entry.accessToken() : null;
    }

    public void invalidate(String key) {
        cache.remove(key);
    }

    public void clear() {
        cache.clear();
    }
}
