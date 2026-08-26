package camel.harness.connectors.m365.core;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.m365.M365Actions;
import camel.harness.connectors.m365.tool.M365CatalogGenerator;

/**
 * Guards the single-source-of-truth invariant: the {@code m365} entry in
 * {@code connectors.yml} must list exactly the operations registered in
 * {@link M365Actions}. If it ever drifts, re-run
 * {@code M365CatalogGenerator} (or the test tells you the diff).
 */
class M365CatalogConsistencyTest {

    @Test
    void yamlOperationsMatchJavaRegistry() throws IOException {
        M365Actions actions = new M365Actions();
        List<String> registry = actions.operationNames();

        List<String> yamlOps;
        String rawYaml;
        try (InputStream stream = getClass().getClassLoader().getResourceAsStream("connectors.yml")) {
            assertTrue(stream != null, "connectors.yml must be on the test classpath");
            rawYaml = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
            mapper.configure(com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES,
                false);
            List<M365ConnectorEntry> entries = mapper.readValue(rawYaml,
                new TypeReference<List<M365ConnectorEntry>>() {
                });
            M365ConnectorEntry m365 = entries.stream()
                .filter(e -> "m365".equals(e.name()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("No m365 entry found in connectors.yml"));
            yamlOps = m365.operations();
        }

        List<String> missingInYaml = registryMissingFrom(registry, yamlOps);
        List<String> extraInYaml = registryMissingFrom(yamlOps, registry);

        String message = """
            connectors.yml m365 operations list is out of sync with M365Actions.
            Run:  mvnw exec:java -Dexec.mainClass=camel.harness.connectors.m365.tool.M365CatalogGenerator
            Missing from YAML: %s
            Extra in YAML:     %s
            """.formatted(missingInYaml, extraInYaml);
        assertEquals(List.of(), missingInYaml, message);
        assertEquals(List.of(), extraInYaml, message);

        // The generator must be idempotent when the YAML is already in sync:
        // regenerating must not change the file content.
        String regenerated = M365CatalogGenerator.regenerate(rawYaml);
        assertEquals(rawYaml, regenerated,
            "M365CatalogGenerator must be a no-op when connectors.yml is already in sync");
    }

    private static List<String> registryMissingFrom(List<String> left, List<String> right) {
        return left.stream().filter(op -> !right.contains(op)).toList();
    }

    /** Minimal shape of a connectors.yml entry, parsed only for the m365 ops list. */
    private record M365ConnectorEntry(String name, List<String> operations) {
    }
}
