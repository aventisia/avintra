package camel.harness.connectors.m365.dto;

import java.util.LinkedHashMap;
import java.util.Map;

import camel.harness.core.AuthConfiguration;

/**
 * Prepared Microsoft Graph REST request. Built by {@link M365DispatchProcessor}
 * from the standard connector envelope and executed by {@link M365Client}.
 *
 * @param path        URL-encoded path relative to the Graph base URL, e.g. {@code /users/alex@contoso.com}
 * @param queryParams query parameters, including OData system query options
 * @param httpMethod  HTTP method (GET/POST/PATCH/PUT/DELETE)
 * @param headers     extra HTTP headers (never contains secrets; auth is applied centrally)
 * @param body        request body (String JSON or raw bytes)
 * @param auth        the auth configuration used to resolve credentials centrally
 * @param paginated   whether the caller wants {@code @odata.nextLink} pagination aggregation
 * @param maxPages    page cap for pagination aggregation
 */
public record M365Request(
        String id,
        String path,
        String httpMethod,
        Map<String, Object> queryParams,
        Map<String, Object> headers,
        Object body,
        AuthConfiguration auth,
        boolean paginated,
        int maxPages) {

    public static Builder builder() {
        return new Builder();
    }

    public static final class Builder {
        private String id;
        private String path = "";
        private String httpMethod = "GET";
        private final Map<String, Object> queryParams = new LinkedHashMap<>();
        private final Map<String, Object> headers = new LinkedHashMap<>();
        private Object body;
        private AuthConfiguration auth;
        private boolean paginated;
        private int maxPages = 5;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder path(String path) {
            this.path = path;
            return this;
        }

        public Builder httpMethod(String httpMethod) {
            this.httpMethod = httpMethod;
            return this;
        }

        public Builder queryParam(String key, Object value) {
            if (key != null && value != null) {
                this.queryParams.put(key, value);
            }
            return this;
        }

        public Builder queryParams(Map<String, Object> values) {
            if (values != null) {
                this.queryParams.putAll(values);
            }
            return this;
        }

        public Builder header(String key, Object value) {
            if (key != null && value != null) {
                this.headers.put(key, value);
            }
            return this;
        }

        public Builder headers(Map<String, Object> values) {
            if (values != null) {
                this.headers.putAll(values);
            }
            return this;
        }

        public Builder body(Object body) {
            this.body = body;
            return this;
        }

        public Builder auth(AuthConfiguration auth) {
            this.auth = auth;
            return this;
        }

        public Builder paginated(boolean paginated) {
            this.paginated = paginated;
            return this;
        }

        public Builder maxPages(int maxPages) {
            this.maxPages = maxPages;
            return this;
        }

        public M365Request build() {
            return new M365Request(id, path, httpMethod, queryParams, headers, body, auth, paginated, maxPages);
        }
    }
}
