package camel.harness.connectors.m365.client;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365Configurer;
import camel.harness.connectors.m365.M365Defaults;
import camel.harness.connectors.m365.auth.M365TokenInspector;
import camel.harness.connectors.m365.dto.M365ErrorType;
import camel.harness.connectors.m365.dto.M365Request;
import camel.harness.connectors.m365.dto.M365Response;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.connectors.m365.util.M365SecretSanitizer;
import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;
import java.lang.reflect.Method;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.camel.Exchange;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;

/**
 * Shared processor behind every {@code direct:m365.<service>.<action>} route.
 * Reads the {@link M365Action} and request state set by {@link M365Configurer},
 * builds a {@link M365Request}, executes it via {@link M365Client} (or delegates
 * complex multi-step operations to a domain service), and places the decoded
 * result on the exchange for the standard harness {@code successResponse()}
 * envelope.
 */
@Component
public class M365DispatchProcessor {

    private static final Pattern PATH_PARAM = Pattern.compile("\\{([^}]+)}");
    private static final String PROP_ACTION = M365Configurer.PROP_ACTION;
    private static final String PROP_BASE_URL = M365Configurer.PROP_BASE_URL;
    private static final String PROP_REQUEST = M365Configurer.PROP_REQUEST;

    private final M365Client client;
    private final Environment environment;

    public M365DispatchProcessor(M365Client client, Environment environment) {
        this.client = client;
        this.environment = environment;
    }

    public void process(Exchange exchange) {
        M365Action action = exchange.getProperty(PROP_ACTION, M365Action.class);
        if (action == null) {
            throw new M365Exception("Missing M365 action; configure through the m365 connector", 400);
        }
        ConnectorRequest request = exchange.getProperty(PROP_REQUEST, ConnectorRequest.class);
        if (action.hasDelegate()) {
            handleDelegate(exchange, action);
            return;
        }
        String baseUrl = effectiveBaseUrl(exchange.getProperty(PROP_BASE_URL, String.class));
        M365Request m365Request = buildRequest(exchange, action, request);
        M365Response response = client.execute(baseUrl, m365Request);
        exchange.getMessage().setBody(response.body());
        exchange.getMessage().setHeader("M365-Status", response.statusCode());
    }

    // ---------------------------------------------------------------------
    // Request building
    // ---------------------------------------------------------------------

    private M365Request buildRequest(Exchange exchange, M365Action action, ConnectorRequest request) {
        Map<String, Object> config = request != null ? request.configurationOrEmpty() : Map.of();
        AuthConfiguration auth = request != null ? request.auth() : null;

        String path = resolvePath(action.path(), config, auth);
        Map<String, Object> query = new LinkedHashMap<>();
        if (action.queryParams() != null) {
            for (String param : action.queryParams()) {
                Object value = config.get(param);
                if (value != null) {
                    query.put(param, value);
                }
            }
        }
        // Surface pagination controls as query params when provided.
        Object top = config.get("$top");
        if (top != null) {
            query.put("$top", top);
        }
        Object skiptoken = config.get("$skiptoken");
        if (skiptoken != null) {
            query.put("$skiptoken", skiptoken);
        }

        Object body = request != null ? request.payload() : null;
        Map<String, Object> headers = new LinkedHashMap<>();
        if (request != null && request.headersOrEmpty() != null) {
            request.headersOrEmpty().forEach((name, value) -> headers.put(name, String.valueOf(value)));
        }
        Object contentType = config.get("contentType");
        if (contentType != null) {
            headers.put("Content-Type", String.valueOf(contentType));
        }

        boolean paginated = action.paginated() || autoPaginate(config);
        int maxPages = 5;
        Object max = config.get("maxPages");
        if (max != null) {
            try {
                maxPages = Integer.parseInt(String.valueOf(max));
            } catch (NumberFormatException ignored) {
                // ignore invalid maxPages, keep default
            }
        }

        return M365Request.builder()
            .path(path)
            .httpMethod(action.method())
            .queryParams(query)
            .headers(headers)
            .body(body)
            .auth(auth)
            .paginated(paginated)
            .maxPages(maxPages)
            .build();
    }

    private String resolvePath(String template, Map<String, Object> config, AuthConfiguration auth) {
        if (template == null || template.isEmpty()) {
            return "";
        }
        // Resolve the user-scoped segment once. When no explicit userId /
        // userPrincipalName is given, a delegated (user) token may use the
        // canonical /me short-hand; app-only tokens must supply an id.
        Object explicitUser = firstNonBlank(config.get("userId"), config.get("userPrincipalName"));
        if (explicitUser == null && template.contains("{userId}")) {
            String idTyp = M365TokenInspector.idTyp(auth, environment);
            if ("user".equals(idTyp)) {
                // Collapse the leading users/{userId} to /me (Graph canonical form).
                template = template.replace("/users/{userId}", "/me");
            } else {
                throw new M365Exception(
                    "Missing required path parameter 'userId' for M365 operation. "
                        + "Provide configuration.userId or configuration.userPrincipalName "
                        + "(required for client_credentials/app-only tokens).", 400,
                    M365ErrorType.MISSING_PARAMETER);
            }
        }
        Matcher matcher = PATH_PARAM.matcher(template);
        StringBuilder resolved = new StringBuilder();
        while (matcher.find()) {
            String name = matcher.group(1);
            Object value = config.get(name);
            if (value == null && "userId".equals(name)) {
                // Accept userPrincipalName as an alias for userId.
                value = config.get("userPrincipalName");
            }
            if (value == null || String.valueOf(value).isBlank()) {
                throw new M365Exception(
                    "Missing required path parameter '" + name + "' for M365 operation", 400,
                    M365ErrorType.MISSING_PARAMETER);
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

    private void handleDelegate(Exchange exchange, M365Action action) {
        Object service = exchange.getContext().getRegistry().lookupByName(action.delegate());
        if (service == null) {
            throw new M365Exception("M365 service bean not found: " + action.delegate(), 500);
        }
        String methodName = camelCase(action.action());
        Method method = findMethod(service.getClass(), methodName);
        if (method == null) {
            throw new M365Exception("M365 service method not found: " + action.delegate() + "#"
                + methodName, 500);
        }
        try {
            Object result = method.invoke(service, exchange);
            exchange.getMessage().setBody(result);
        } catch (java.lang.reflect.InvocationTargetException e) {
            Throwable cause = e.getCause();
            if (cause instanceof M365Exception m365) {
                throw m365;
            }
            throw new M365Exception("M365 service '" + action.delegate() + "." + methodName
                + "' failed: " + safe(cause), 500);
        } catch (IllegalAccessException e) {
            throw new M365Exception("Cannot access M365 service method " + methodName, 500);
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
    // Helpers
    // ---------------------------------------------------------------------

    private static boolean autoPaginate(Map<String, Object> config) {
        Object value = config.get("autoPaginate");
        return value != null && (Boolean.TRUE.equals(value)
            || ("true").equalsIgnoreCase(String.valueOf(value)));
    }

    private static Object firstNonBlank(Object first, Object second) {
        if (first != null && !String.valueOf(first).isBlank()) {
            return first;
        }
        return second;
    }

    private String effectiveBaseUrl(String configured) {
        if (configured != null && !configured.isBlank()) {
            return stripTrailingSlash(configured);
        }
        return M365Defaults.baseUrl(environment);
    }

    private static String stripTrailingSlash(String value) {
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private static String urlEncode(String value) {
        return java.net.URLEncoder.encode(value, java.nio.charset.StandardCharsets.UTF_8);
    }

    private static String safe(Throwable t) {
        String message = t.getMessage();
        return M365SecretSanitizer.sanitize(message != null ? message : t.getClass().getSimpleName());
    }
}
