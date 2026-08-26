package camel.harness.connectors.m365.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.dto.M365ErrorType;
import camel.harness.connectors.m365.error.M365ApiException;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.connectors.m365.error.M365RateLimitException;

/**
 * Validates the canonical error taxonomy: every M365 exception exposes a stable
 * {@link M365ErrorType} code regardless of how it was constructed, and the
 * provider (Graph) details are preserved alongside.
 */
class M365ErrorTaxonomyTest {

    @Test
    void statusCodesMapToCanonicalTypes() {
        assertEquals(M365ErrorType.INVALID_INPUT, new M365Exception("bad", 400).errorType());
        assertEquals(M365ErrorType.AUTHENTICATION_FAILED, new M365Exception("auth", 401).errorType());
        assertEquals(M365ErrorType.INSUFFICIENT_PERMISSIONS, new M365Exception("perm", 403).errorType());
        assertEquals(M365ErrorType.NOT_FOUND, new M365Exception("missing", 404).errorType());
        assertEquals(M365ErrorType.CONFLICT, new M365Exception("conflict", 409).errorType());
        assertEquals(M365ErrorType.RATE_LIMITED, new M365Exception("throttled", 429).errorType());
        assertEquals(M365ErrorType.PROVIDER_ERROR, new M365Exception("upstream", 500).errorType());
    }

    @Test
    void explicitTypeWinsOverStatus() {
        M365Exception e = new M365Exception("custom", 400, M365ErrorType.MISSING_PARAMETER);
        assertEquals(M365ErrorType.MISSING_PARAMETER, e.errorType());
        assertEquals(400, e.statusCode());
    }

    @Test
    void apiExceptionCarriesGraphCodeAndRefinedType() {
        M365ApiException denied = new M365ApiException("access denied", 403, "AuthorizationRequestDenied");
        assertEquals(M365ErrorType.INSUFFICIENT_PERMISSIONS, denied.errorType());
        assertEquals("AuthorizationRequestDenied", denied.code());

        M365ApiException notFound = new M365ApiException("no such item", 404, "itemNotFound");
        assertEquals(M365ErrorType.NOT_FOUND, notFound.errorType());
        assertEquals("itemNotFound", notFound.code());
    }

    @Test
    void rateLimitExceptionIsTypedAndCarriesRetryAfter() {
        M365RateLimitException rate = new M365RateLimitException("throttled", 429, 30);
        assertEquals(M365ErrorType.RATE_LIMITED, rate.errorType());
        assertEquals(30, rate.retryAfterSeconds());
        assertEquals(429, rate.statusCode());
    }

    @Test
    void errorTypeCodesAreStableSnakeCase() {
        for (M365ErrorType type : M365ErrorType.values()) {
            assertNotNull(type.code());
            assertEquals(type.code(), type.code().toLowerCase());
        }
    }
}
