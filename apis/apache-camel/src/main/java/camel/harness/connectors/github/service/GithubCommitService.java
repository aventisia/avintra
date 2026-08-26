package camel.harness.connectors.github.service;

import camel.harness.connectors.github.GithubConfigurer;
import camel.harness.connectors.github.client.GithubClient;
import camel.harness.connectors.github.dto.GithubRequest;
import camel.harness.connectors.github.error.GithubException;
import camel.harness.core.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.camel.Exchange;
import org.springframework.stereotype.Component;

/**
 * Domain service for the {@code commit} service family. The GitHub Commits API
 * does not expose a dedicated "list files for commit" endpoint, so
 * {@code list-files} is implemented as fetch-then-extract: the commit is fetched
 * via {@code GET /repos/{owner}/{repo}/commits/{ref}} and the {@code files} array
 * is extracted from the returned commit object. Callers never need to page or
 * re-shape the payload themselves.
 */
@Component("commit")
public class GithubCommitService {

    private final GithubClient client;

    public GithubCommitService(GithubClient client) {
        this.client = client;
    }

    /** Returns the {@code files} array of a commit. */
    public Object listFiles(Exchange exchange) {
        ConnectorRequest request = Request(exchange);
        Map<String, Object> config = request.configurationOrEmpty();
        String owner = required(config, "owner", "owner is required for commit.list-files");
        String repo = required(config, "repo", "repo is required for commit.list-files");
        String ref = required(config, "ref", "ref is required for commit.list-files");

        GithubRequest getRequest = GithubRequest.builder()
            .path("/repos/" + urlEncode(owner) + "/" + urlEncode(repo) + "/commits/" + urlEncode(ref))
            .httpMethod("GET")
            .auth(request.auth())
            .build();
        Object result = client.execute(effectiveBaseUrl(exchange), getRequest).body();
        if (result instanceof Map<?, ?> map) {
            Object files = map.get("files");
            return files != null ? files : new ArrayList<>();
        }
        throw new GithubException(
            "commit.list-files: unexpected response shape for commit '" + ref
                + "' in " + owner + "/" + repo, 502);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

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

    private static String required(Map<String, Object> config, String key, String message) {
        Object value = config.get(key);
        if (value == null || String.valueOf(value).isBlank()) {
            throw new GithubException(message, 400);
        }
        return String.valueOf(value);
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}
