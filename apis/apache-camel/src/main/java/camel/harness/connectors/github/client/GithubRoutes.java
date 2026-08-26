package camel.harness.connectors.github.client;

import camel.harness.connectors.github.GithubAction;
import camel.harness.connectors.github.GithubActions;
import camel.harness.connectors.github.error.GithubException;
import camel.harness.connectors.github.util.GithubSecretSanitizer;
import camel.harness.core.*;
import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

/**
 * Registers one {@code direct:github.<service>.<action>} route for every
 * {@link GithubAction} descriptor in {@link GithubActions}. Each route funnels
 * into the shared {@link GithubDispatchProcessor}.
 *
 * <p>GitHub failures are handled here (Camel error handlers are scoped to the
 * RouteBuilder that declares them, so {@link ConnectorApiRoute}'s {@code
 * onException} does not see exceptions raised in these routes). The handler
 * writes the standard error envelope with the GitHub HTTP status and a
 * sanitized message, and marks the exchange so the shared {@code successResponse()}
 * does not re-wrap it.</p>
 */
@Component
public class GithubRoutes extends RouteBuilder {

    /** Exchange property set when a GitHub error envelope has already been produced. */
    public static final String PROP_ERROR_HANDLED = "githubErrorHandled";

    private final GithubActions actions;
    private final GithubDispatchProcessor dispatch;
    private final ObjectMapper objectMapper;

    public GithubRoutes(GithubActions actions, GithubDispatchProcessor dispatch, ObjectMapper objectMapper) {
        this.actions = actions;
        this.dispatch = dispatch;
        this.objectMapper = objectMapper;
    }

    @Override
    public void configure() {
        onException(GithubException.class)
            .handled(true)
            .process(errorProcessor());

        for (GithubAction action : actions.all()) {
            from(action.route())
                .routeId(action.route())
                .process(dispatch::process);
        }
    }

    private Processor errorProcessor() {
        return exchange -> {
            Throwable failure = exchange.getProperty(Exchange.EXCEPTION_CAUGHT, Throwable.class);
            int status = 502;
            String message = "GitHub connector failure";
            String type = "Exception";
            if (failure instanceof GithubException github) {
                status = github.statusCode();
                type = github.getClass().getSimpleName();
                message = GithubSecretSanitizer.sanitize(github.getMessage());
            } else if (failure != null) {
                type = failure.getClass().getSimpleName();
                message = GithubSecretSanitizer.sanitize(failure.getMessage() != null
                    ? failure.getMessage() : type);
            }
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("ok", false);
            response.put("connector", "github");
            response.put("targetUri", exchange.getProperty("targetUri"));
            response.put("error", message);
            response.put("type", type);
            exchange.getMessage().setHeader(Exchange.HTTP_RESPONSE_CODE, status);
            exchange.getMessage().setHeader(Exchange.CONTENT_TYPE, "application/json");
            exchange.getMessage().setBody(objectMapper.writeValueAsString(response));
            exchange.setProperty(PROP_ERROR_HANDLED, true);
        };
    }
}
