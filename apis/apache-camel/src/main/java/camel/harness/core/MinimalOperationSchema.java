package camel.harness.core;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Minimal request schema for a single connector operation. Contains only the
 * fields required to build a valid request body for
 * {@code POST /connectors/{connector}/operations/{operation}/execute}.
 *
 * @param connector connector family name
 * @param operation operation name
 * @param fields    ordered list of request fields
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record MinimalOperationSchema(
        String connector,
        String operation,
        List<ConnectorOperationField> fields) {
}
