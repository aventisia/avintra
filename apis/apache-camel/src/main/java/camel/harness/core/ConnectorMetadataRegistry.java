package camel.harness.core;

import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class ConnectorMetadataRegistry {

    private static final String CONNECTORS_YML = "connectors.yml";
    private final CamelCatalogMetadataLoader catalogLoader;
    private final Map<String, ConnectorMetadata> metadataByName = new LinkedHashMap<>();
    private final Map<String, ConnectorMetadata> metadataByScheme = new LinkedHashMap<>();

    public ConnectorMetadataRegistry(CamelCatalogMetadataLoader catalogLoader) {
        this.catalogLoader = catalogLoader;
    }

    @PostConstruct
    public void load() {
        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
        try (InputStream stream = getClass().getClassLoader().getResourceAsStream(CONNECTORS_YML)) {
            if (stream == null) {
                throw new IllegalStateException("Connector metadata not found on classpath: " + CONNECTORS_YML);
            }
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> entries = mapper.readValue(stream, List.class);
            for (Map<String, Object> entry : entries) {
                ConnectorMetadata metadata = toMetadata(entry);
                metadataByName.put(metadata.name(), metadata);
                for (String scheme : metadata.schemes()) {
                    metadataByScheme.put(scheme.toLowerCase(), metadata);
                }
            }
            // Merge Camel Catalog metadata for everything else, but keep YAML as override.
            catalogLoader.loadAll().forEach((name, catalogMetadata) -> {
                metadataByName.putIfAbsent(name, catalogMetadata);
                for (String scheme : catalogMetadata.schemes()) {
                    metadataByScheme.putIfAbsent(scheme.toLowerCase(), catalogMetadata);
                }
            });
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load connector metadata", e);
        }
    }

    public ConnectorMetadata forConnector(String connector) {
        return metadataByName.get(connector.toLowerCase());
    }

    public ConnectorMetadata forScheme(String scheme) {
        int optionStart = scheme.indexOf('?');
        String clean = optionStart >= 0 ? scheme.substring(0, optionStart) : scheme;
        int authorityStart = clean.indexOf(":");
        if (authorityStart > 0) {
            clean = clean.substring(0, authorityStart);
        }
        return metadataByScheme.get(clean.toLowerCase());
    }

    public Map<String, ConnectorMetadata> all() {
        return Collections.unmodifiableMap(metadataByName);
    }

    @SuppressWarnings("unchecked")
    private static ConnectorMetadata toMetadata(Map<String, Object> entry) {
        return new ConnectorMetadata(
                (String) entry.get("name"),
                (String) entry.get("description"),
                (List<String>) entry.get("schemes"),
                (List<String>) entry.getOrDefault("operations", Collections.emptyList()),
                (List<String>) entry.getOrDefault("requiredConfig", Collections.emptyList()),
                (List<String>) entry.getOrDefault("optionalConfig", Collections.emptyList()),
                (List<String>) entry.getOrDefault("requiredAuth", Collections.emptyList()),
                (List<String>) entry.getOrDefault("optionalAuth", Collections.emptyList()),
                (List<String>) entry.getOrDefault("notes", Collections.emptyList()),
                (String) entry.get("operationOption"));
    }
}
