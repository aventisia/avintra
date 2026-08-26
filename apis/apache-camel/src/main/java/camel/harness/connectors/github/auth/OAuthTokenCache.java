package camel.harness.connectors.github.auth;

import camel.harness.core.*;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * In-memory cache of OAuth access tokens keyed by a stable client identity
 * (clientId + tokenUrl + scopes). Thread-safe; tokens are refreshed lazily by
 * {@link GithubAuthService} when expired or when GitHub returns 401.
 *
 * <p>Deliberately in-memory and single-node: matches the harness's
 * single-process test-harness scope. Secrets never leave this component except
 * through the auth service, and are never logged.</p>
 */
@Component
public class OAuthTokenCache {

    private static final long MARGIN_SECONDS = 30;

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

    public String refreshToken(String key) {
        CachedToken entry = cache.get(key);
        return entry != null ? entry.refreshToken() : null;
    }

    public void invalidate(String key) {
        cache.remove(key);
    }
}
