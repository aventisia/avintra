package camel.harness.connectors.github.client;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubConfigurer;
import camel.harness.connectors.github.dto.GithubRequest;
import camel.harness.connectors.github.dto.GithubResponse;
import camel.harness.connectors.github.error.GithubException;
import camel.harness.connectors.github.service.GithubWebhookService;
import camel.harness.connectors.github.util.GithubSecretSanitizer;
import camel.harness.core.*;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.camel.Exchange;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

/**
 * Shared processor behind every {@code direct:github.<service>.<action>} route.
 * Reads the {@link GithubAction} and request state set by {@link GithubConfigurer},
 * builds a {@link GithubRequest}, executes it via {@link GithubClient} (or handles
 * local-only webhook-event actions), and places the decoded result on the exchange
 * for the standard harness {@code successResponse()} envelope.
 */
@Component
public class GithubDispatchProcessor {

    private static final Pattern PATH_PARAM = Pattern.compile("\\{([^}]+)}");
    private static final String PROP_ACTION = GithubConfigurer.PROP_ACTION;
    private static final String PROP_BASE_URL = GithubConfigurer.PROP_BASE_URL;
    private static final String PROP_REQUEST = GithubConfigurer.PROP_REQUEST;

    private final GithubClient client;
    private final GithubWebhookService webhookService;
    private final Environment environment;

    public GithubDispatchProcessor(GithubClient client, GithubWebhookService webhookService,
            Environment environment) {
        this.client = client;
        this.webhookService = webhookService;
        this.environment = environment;
    }

    public void process(Exchange exchange) {
        GithubAction action = exchange.getProperty(PROP_ACTION, GithubAction.class);
        if (action == null) {
            throw new GithubException("Missing GitHub action; configure through the github connector", 400);
        }
        ConnectorRequest request = exchange.getProperty(PROP_REQUEST, ConnectorRequest.class);
        if (action.localOnly()) {
            handleLocal(exchange, action, request);
            return;
        }
        if (action.hasDelegate()) {
            handleDelegate(exchange, action);
            return;
        }
        String baseUrl = effectiveBaseUrl(exchange.getProperty(PROP_BASE_URL, String.class));
        GithubRequest githubRequest = buildRequest(exchange, action, request);
        GithubResponse response = client.execute(baseUrl, githubRequest);
        exchange.getMessage().setBody(response.body());
        exchange.getMessage().setHeader("Github-Status", response.statusCode());
    }

    // ---------------------------------------------------------------------
    // Request building
    // ---------------------------------------------------------------------

    private GithubRequest buildRequest(Exchange exchange, GithubAction action, ConnectorRequest request) {
        Map<String, Object> config = request != null ? request.configurationOrEmpty() : Map.of();
        AuthConfiguration auth = request != null ? request.auth() : null;

        // Path parameters: {owner}, {repo}, {branch}, ... resolved from configuration.
        String path = resolvePath(action.path(), config);
        Map<String, Object> query = new LinkedHashMap<>();
        if (action.queryParams() != null) {
            for (String param : action.queryParams()) {
                Object value = config.get(param);
                if (value != null) {
                    query.put(param, value);
                }
            }
        }
        // Always surface pagination controls as query params when provided.
        Object perPage = config.get("per_page");
        if (perPage != null) {
            query.put("per_page", perPage);
        }
        Object page = config.get("page");
        if (page != null) {
            query.put("page", page);
        }

        Object body = request != null ? request.payload() : null;
        Object contentType = config.get("contentType");
        Map<String, Object> headers = new LinkedHashMap<>();
        if (body != null && contentType != null) {
            headers.put("Content-Type", String.valueOf(contentType));
        }
        if (request != null && request.headersOrEmpty() != null) {
            request.headersOrEmpty().forEach((name, value) -> headers.put(name, String.valueOf(value)));
        }

        boolean paginated = action.paginated();
        int maxPages = 5;
        Object max = config.get("maxPages");
        if (max != null) {
            try {
                maxPages = Integer.parseInt(String.valueOf(max));
            } catch (NumberFormatException ignored) {
                // ignore invalid maxPages, keep default
            }
        }

        GithubRequest.Builder builder = GithubRequest.builder()
            .path(path)
            .httpMethod(action.method())
            .queryParams(query)
            .headers(headers)
            .body(body)
            .auth(auth)
            .paginated(paginated)
            .maxPages(maxPages);
        return builder.build();
    }

    private String resolvePath(String template, Map<String, Object> config) {
        if (template == null || template.isEmpty()) {
            return "";
        }
        Matcher matcher = PATH_PARAM.matcher(template);
        StringBuilder resolved = new StringBuilder();
        while (matcher.find()) {
            String name = matcher.group(1);
            Object value = config.get(name);
            if (value == null || String.valueOf(value).isBlank()) {
                throw new GithubException(
                    "Missing required path parameter '" + name + "' for GitHub operation", 400);
            }
            matcher.appendReplacement(resolved,
                Matcher.quoteReplacement(urlEncode(String.valueOf(value))));
        }
        matcher.appendTail(resolved);
        return resolved.toString();
    }

    // ---------------------------------------------------------------------
    // Delegation to domain services (complex multi-step operations)
    // ---------------------------------------------------------------------

    private void handleDelegate(Exchange exchange, GithubAction action) {
        Object service = exchange.getContext().getRegistry().lookupByName(action.delegate());
        if (service == null) {
            throw new GithubException("GitHub service bean not found: " + action.delegate(), 500);
        }
        String methodName = camelCase(action.action());
        Method method = findMethod(service.getClass(), methodName);
        if (method == null) {
            throw new GithubException("GitHub service method not found: " + action.delegate() + "#"
                + methodName, 500);
        }
        try {
            Object result = method.invoke(service, exchange);
            exchange.getMessage().setBody(result);
        } catch (java.lang.reflect.InvocationTargetException e) {
            Throwable cause = e.getCause();
            if (cause instanceof GithubException github) {
                throw github;
            }
            throw new GithubException("GitHub service '" + action.delegate() + "." + methodName
                + "' failed: " + GithubSecretSanitizer.sanitize(
                    cause != null && cause.getMessage() != null ? cause.getMessage()
                        : String.valueOf(cause)), 500);
        } catch (IllegalAccessException e) {
            throw new GithubException("Cannot access GitHub service method " + methodName, 500);
        }
    }

    private static Method findMethod(Class<?> type, String name) {
        for (Method method : type.getMethods()) {
            if (method.getName().equals(name) && method.getParameterCount() == 1
                    && method.getParameterTypes()[0] == Exchange.class) {
                return method;
            }
        }
        return null;
    }

    private static String camelCase(String value) {
        StringBuilder result = new StringBuilder();
        boolean upper = false;
        for (char c : value.toCharArray()) {
            if (c == '-' || c == '_' || c == '.') {
                upper = true;
                continue;
            }
            result.append(upper ? Character.toUpperCase(c) : c);
            upper = false;
        }
        return result.toString();
    }

    // ---------------------------------------------------------------------
    // Local (webhook-event) actions
    // ---------------------------------------------------------------------

    private void handleLocal(Exchange exchange, GithubAction action, ConnectorRequest request) {
        Map<String, Object> config = request != null ? request.configurationOrEmpty() : Map.of();
        String payload = exchange.getMessage().getBody(String.class);
        String event = (String) config.get("event");
        String secret = (String) config.get("secret");
        if (secret == null) {
            secret = environment != null ? environment.getProperty("github.webhook.secret") : null;
        }

        switch (action.action()) {
            case "receive" -> {
                if (payload == null || payload.isBlank()) {
                    throw new GithubException("Webhook payload body is required", 400);
                }
                exchange.getMessage().setBody(Map.of(
                    "received", true,
                    "event", event == null ? "unknown" : event,
                    "payloadSize", payload.length()));
            }
            case "verify" -> {
                String header = (String) config.getOrDefault("signature", "");
                if (secret == null || secret.isEmpty()) {
                    throw new GithubException("Webhook secret is required to verify a signature", 400);
                }
                boolean valid = webhookService.verifySignature(header, payload, secret);
                exchange.getMessage().setBody(Map.of("verified", valid));
            }
            case "route-event" -> {
                if (payload == null || payload.isBlank()) {
                    throw new GithubException("Webhook payload body is required", 400);
                }
                String routedTo = event == null ? "unknown" : event;
                exchange.getMessage().setBody(Map.of(
                    "routed", true,
                    "event", routedTo,
                    "payloadSize", payload.length()));
            }
            default -> throw new GithubException("Unsupported local webhook action: " + action.action(), 400);
        }
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private String effectiveBaseUrl(String configured) {
        if (configured != null && !configured.isBlank()) {
            return configured;
        }
        if (environment != null) {
            String envValue = environment.getProperty("github.base-url");
            if (envValue != null && !envValue.isBlank()) {
                return envValue;
            }
        }
        return "https://api.github.com";
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
