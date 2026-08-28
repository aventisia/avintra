package camel.harness.connectors.m365.client;

import camel.harness.connectors.m365.M365Action;
import camel.harness.connectors.m365.M365Actions;
import camel.harness.connectors.m365.dto.M365ErrorType;
import camel.harness.connectors.m365.error.M365ApiException;
import camel.harness.connectors.m365.error.M365Exception;
import camel.harness.connectors.m365.error.M365RateLimitException;
import camel.harness.connectors.m365.util.M365SecretSanitizer;
import java.util.LinkedHashMap;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.camel.Exchange;
import org.apache.camel.Processor;
import org.apache.camel.builder.RouteBuilder;
import org.springframework.stereotype.Component;

/**
 * Registers one {@code direct:m365.<service>.<action>} route for every
 * {@link M365Action} descriptor in {@link M365Actions}. Each route funnels into
 * the shared {@link M365DispatchProcessor}.
 *
 * <p>M365 failures are handled here (Camel error handlers are scoped to the
 * RouteBuilder that declares them, so {@code ConnectorApiRoute}'s {@code
 * onException} does not see exceptions raised in these routes). The handler
 * writes the standard error envelope with the Graph HTTP status and a sanitized
 * message, and marks the exchange so the shared {@code successResponse()} does
 * not re-wrap it.</p>
 */
@Component
public class M365Routes extends RouteBuilder {

    /** Exchange property set when an M365 error envelope has already been produced. */
    public static final String PROP_ERROR_HANDLED = "m365ErrorHandled";

    private final M365Actions actions;
    private final M365DispatchProcessor dispatch;
    private final ObjectMapper objectMapper;

    public M365Routes(M365Actions actions, M365DispatchProcessor dispatch, ObjectMapper objectMapper) {
        this.actions = actions;
        this.dispatch = dispatch;
        this.objectMapper = objectMapper;
    }

    @Override
    public void configure() {
        onException(M365Exception.class)
            .handled(true)
            .process(errorProcessor());

        for (M365Action action : actions.all()) {
            from(action.route())
                .routeId(action.route())
                .process(dispatch::process);
        }
    }

    private Processor errorProcessor() {
        return exchange -> {
            Throwable failure = exchange.getProperty(Exchange.EXCEPTION_CAUGHT, Throwable.class);
            int status = 502;
            String message = "M365 connector failure";
            String code = M365ErrorType.UNKNOWN.code();
            String graphCode = null;
            long retryAfterSeconds = 0;
            if (failure instanceof M365Exception m365) {
                status = m365.statusCode();
                code = m365.errorType().code();
                message = M365SecretSanitizer.sanitize(m365.getMessage());
                if (failure instanceof M365ApiException api) {
                    graphCode = api.code();
                }
                if (failure instanceof M365RateLimitException rate) {
                    retryAfterSeconds = rate.retryAfterSeconds();
                }
            } else if (failure != null) {
                code = M365ErrorType.UNKNOWN.code();
                message = M365SecretSanitizer.sanitize(failure.getMessage() != null
                    ? failure.getMessage() : failure.getClass().getSimpleName());
            }
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", false);
            response.put("connector", "m365");
            response.put("operation", exchange.getProperty("operation"));
            response.put("data", null);
            Map<String, Object> error = new LinkedHashMap<>();
            error.put("code", code);
            error.put("message", message);
            if (graphCode != null) {
                error.put("graphCode", graphCode);
            }
            if (retryAfterSeconds > 0) {
                error.put("retryAfterSeconds", retryAfterSeconds);
            }
            response.put("error", error);
            exchange.getMessage().setHeader(Exchange.HTTP_RESPONSE_CODE, status);
            exchange.getMessage().setHeader(Exchange.CONTENT_TYPE, "application/json");
            exchange.getMessage().setBody(objectMapper.writeValueAsString(response));
            exchange.setProperty(PROP_ERROR_HANDLED, true);
        };
    }
}
