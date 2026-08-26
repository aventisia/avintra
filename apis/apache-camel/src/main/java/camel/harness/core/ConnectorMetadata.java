package camel.harness.core;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;

public record ConnectorMetadata(
        String name,
        String description,
        List<String> schemes,
        List<String> operations,
        List<String> requiredConfig,
        List<String> optionalConfig,
        List<String> requiredAuth,
        List<String> optionalAuth,
        List<String> notes) {

    public Set<String> schemeSet() {
        return schemes == null ? Collections.emptySet() : Set.copyOf(schemes);
    }

    public boolean supportsOperation(String operation) {
        if (operation == null || operation.isBlank()) {
            return true;
        }
        return operations == null || operations.isEmpty() || operations.contains(operation);
    }

    public void validate(Map<String, Object> configuration, AuthConfiguration auth) {
        if (requiredConfig != null) {
            for (String key : requiredConfig) {
                if (configuration == null || isBlank(configuration.get(key))) {
                    throw new IllegalArgumentException("Missing required configuration: " + key);
                }
            }
        }
        if (requiredAuth != null && !requiredAuth.isEmpty()) {
            if (auth == null || auth.authType() == AuthType.NONE) {
                throw new IllegalArgumentException("Authentication is required for connector: " + name);
            }
            if (auth.properties() != null) {
                for (String key : requiredAuth) {
                    if (isBlank(auth.properties().get(key))) {
                        throw new IllegalArgumentException("Missing required auth property: " + key);
                    }
                }
            }
        }
    }

    private static boolean isBlank(Object value) {
        return value == null || (value instanceof String string && string.isBlank());
    }
}
