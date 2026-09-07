package camel.harness.core;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.camel.catalog.CamelCatalog;
import org.apache.camel.catalog.DefaultCamelCatalog;
import org.apache.camel.tooling.model.BaseOptionModel;
import org.apache.camel.tooling.model.ComponentModel;
import org.springframework.stereotype.Component;

/**
 * Loads connector metadata from the Apache Camel Catalog. This makes the harness
 * aware of every Camel component published in the catalog (~350 components),
 * even if no hand-written configurer exists.
 */
@Component
public class CamelCatalogMetadataLoader {

    private final CamelCatalog catalog = new DefaultCamelCatalog(true);

    public List<String> findComponentNames() {
        return catalog.findComponentNames();
    }

    public ConnectorMetadata load(String componentName) {
        ComponentModel model = catalog.componentModel(componentName);
        if (model == null) {
            return null;
        }

        List<String> schemes = new ArrayList<>();
        schemes.add(model.getScheme());
        String alternativeSchemes = model.getAlternativeSchemes();
        if (alternativeSchemes != null && !alternativeSchemes.isBlank()) {
            for (String alt : alternativeSchemes.split(",")) {
                String trimmed = alt.trim();
                if (!trimmed.isEmpty()) {
                    schemes.add(trimmed);
                }
            }
        }

        List<String> requiredConfig = new ArrayList<>();
        List<String> optionalConfig = new ArrayList<>();
        List<String> operations = new ArrayList<>();
        String operationOption = null;
        for (BaseOptionModel option : model.getEndpointOptions()) {
            if (Boolean.TRUE.equals(option.isRequired())) {
                requiredConfig.add(option.getName());
            } else {
                optionalConfig.add(option.getName());
            }
            // Extract the operation enum from operation-like options so the
            // schema endpoints can list the supported operations for catalog
            // components (e.g. aws2-s3?operation=copyObject).
            if (isOperationOption(option.getName()) && option.getEnums() != null && !option.getEnums().isEmpty()) {
                operations.addAll(option.getEnums());
                if (operationOption == null) {
                    operationOption = option.getName();
                }
            }
        }

        return new ConnectorMetadata(
                componentName,
                model.getDescription(),
                schemes,
                operations,
                requiredConfig,
                optionalConfig,
                Collections.emptyList(),
                Collections.emptyList(),
                List.of("Loaded from Apache Camel Catalog. Hand-written configurer may be needed for auth/body shaping."),
                operationOption);
    }

    /**
     * Option names that carry the operation/method/action enum for a component.
     */
    private static boolean isOperationOption(String name) {
        if (name == null) {
            return false;
        }
        return switch (name) {
            case "operation", "operationName", "methodName", "httpMethod",
                 "producerOperation", "action", "command", "method",
                 "defaultOperation", "cryptoOperation", "stateOperation",
                 "lockOperation", "workflowOperation", "chatOperation",
                 "controlAction", "messageAction", "coapMethodRestrict" -> true;
            default -> false;
        };
    }

    public Map<String, ConnectorMetadata> loadAll() {
        Map<String, ConnectorMetadata> result = new LinkedHashMap<>();
        for (String name : findComponentNames()) {
            ConnectorMetadata metadata = load(name);
            if (metadata != null) {
                result.put(name, metadata);
            }
        }
        return result;
    }
}
