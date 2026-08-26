package camel.harness.connectors.github.service;

import camel.harness.connectors.github.GithubConfigurer;
import camel.harness.connectors.github.client.GithubClient;
import camel.harness.connectors.github.dto.GithubRequest;
import camel.harness.connectors.github.error.GithubException;
import camel.harness.core.*;
import java.util.LinkedHashMap;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

/**
 * Domain service for the {@code file} service family. The GitHub Contents API
 * requires the current blob {@code sha} of a file to delete or overwrite it, so
 * {@code delete} is implemented as read-then-delete: the file is fetched first
 * (via {@code GET /repos/{owner}/{repo}/contents/{path}}), the returned {@code sha}
 * is merged into the caller's payload, and the DELETE is then sent. Callers never
 * need to supply a (frequently stale) {@code sha} themselves.
 */
@Component("file")
public class GithubFileService {

    private final GithubClient client;

    public GithubFileService(GithubClient client) {
        this.client = client;
    }

    /** Deletes a file, resolving the current SHA from the contents API first. */
    public Object delete(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request.configurationOrEmpty();
        String owner = required(config, "owner", "owner is required for file.delete");
        String repo = required(config, "repo", "repo is required for file.delete");
        String path = required(config, "path", "path is required for file.delete");

        Map<String, Object> payload = payloadMap(request);
        String sha = firstNonBlank(payload.get("sha"), config.get("sha"));
        if (sha == null || sha.isBlank()) {
            sha = currentSha(exchange, owner, repo, path);
            if (sha == null || sha.isBlank()) {
                throw new GithubException(
                    "file.delete: could not resolve the current sha for '" + path
                        + "' in " + owner + "/" + repo + "; the file may not exist", 404);
            }
        }

        Map<String, Object> deleteBody = new LinkedHashMap<>();
        deleteBody.put("message", firstNonBlank(payload.get("message"), "Delete " + path));
        deleteBody.put("sha", sha);
        if (payload.get("branch") != null) {
            deleteBody.put("branch", String.valueOf(payload.get("branch")));
        }

        GithubRequest deleteRequest = GithubRequest.builder()
            .path("/repos/" + urlEncode(owner) + "/" + urlEncode(repo) + "/contents/" + urlEncode(path))
            .httpMethod("DELETE")
            .body(deleteBody)
            .auth(request.auth())
            .build();
        return client.execute(effectiveBaseUrl(exchange), deleteRequest).body();
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private String currentSha(Exchange exchange, String owner, String repo, String path) {
        ConnectorRequest request = Request(exchange);
        GithubRequest getRequest = GithubRequest.builder()
            .path("/repos/" + urlEncode(owner) + "/" + urlEncode(repo) + "/contents/" + urlEncode(path))
            .httpMethod("GET")
            .auth(request.auth())
            .build();
        Object result = client.execute(effectiveBaseUrl(exchange), getRequest).body();
        if (result instanceof Map<?, ?> map) {
            Object sha = map.get("sha");
            return sha == null ? null : String.valueOf(sha);
        }
        return null;
    }

    private static ConnectorRequest Request(Exchange exchange) {
        return exchange.getProperty(GithubConfigurer.PROP_REQUEST, ConnectorRequest.class);
    }

    private static String effectiveBaseUrl(Exchange exchange) {
        String configured = exchange.getProperty(GithubConfigurer.PROP_BASE_URL, String.class);
        return configured != null && !configured.isBlank()
            ? stripTrailingSlash(configured) : "https://api.github.com";
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private static Map<String, Object> payloadMap(ConnectorRequest request) {
        Object payload = request.payload();
        if (!(payload instanceof Map<?, ?> map)) {
            throw new GithubException("file.delete requires a payload map {message, sha, branch}", 400);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        map.forEach((k, v) -> result.put(String.valueOf(k), v));
        return result;
    }

    private static String required(Map<String, Object> config, String key, String message) {
        Object value = config.get(key);
        if (value == null || String.valueOf(value).isBlank()) {
            throw new GithubException(message, 400);
        }
        return String.valueOf(value);
    }

    private static String firstNonBlank(Object... values) {
        for (Object value : values) {
            if (value != null && !String.valueOf(value).isBlank()) {
                return String.valueOf(value);
            }
        }
        return null;
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
