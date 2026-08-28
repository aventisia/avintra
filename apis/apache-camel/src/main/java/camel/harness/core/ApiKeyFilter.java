package camel.harness.core;

import java.io.IOException;
import java.util.Set;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;

/**
 * Hardening gate for the Camel connector harness (Q4). Enforces the connector
 * allowlist — only the supported connector families are reachable
 * ({@code file, ftp, http, jdbc, jms, kafka, mail, sql, github, m365}). This closes
 * the dynamic-URI dispatch to arbitrary Camel schemes.
 *
 * <p>The harness is intended to be reachable only from the internal Docker network,
 * never from the public internet.</p>
 */
@Component
public class ApiKeyFilter implements Filter {

    private final Set<String> allowedConnectors =
        Set.of("file", "ftp", "http", "jdbc", "jms", "kafka", "mail", "sql", "github", "m365");

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Connector allowlist. The Camel Rest DSL exposes /connectors/{connector};
        // reject any path segment that isn't an allowed family. Schema endpoints are
        // allowed for any connector in the allowlist too. The structured execute
        // endpoint (/connectors/execute) is always allowed.
        String path = httpRequest.getRequestURI();
        if (path != null && path.contains("/connectors/")) {
            String rest = path.substring(path.indexOf("/connectors/") + "/connectors/".length());
            int slash = rest.indexOf('/');
            String connector = (slash >= 0 ? rest.substring(0, slash) : rest).toLowerCase();
            if (!connector.isEmpty() && !"execute".equals(connector)
                    && !allowedConnectors.contains(connector)) {
                httpResponse.setStatus(HttpServletResponse.SC_FORBIDDEN);
                httpResponse.setContentType("application/json");
                httpResponse.getWriter().write(
                    "{\"ok\":false,\"error\":\"Connector '" + connector + "' is not in the allowlist\"}");
                return;
            }
        }

        chain.doFilter(request, response);
    }
}
