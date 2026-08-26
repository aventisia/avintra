package camel.harness.connectors.file.directory;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.file.FileConfigurer;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the File {@code directory} service: {@code read} /
 * {@code write} / {@code append} share the same producer URI with an optional
 * {@code fileName} option.
 */
class DirectoryReadWriteTest {

    private final FileConfigurer configurer = new FileConfigurer();

    private String resolve(String operation, Map<String, Object> config) {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = new ConnectorRequest(null, null, "file", operation, config,
            null, null, null, null, null);
        return configurer.resolveEndpoint(exchange, request, null);
    }

    @Test
    void buildsFileUriFromDirectory() {
        assertEquals("file:/tmp/camel-harness", resolve("read", Map.of("directoryName", "/tmp/camel-harness")));
    }

    @Test
    void appendsFileNameOption() {
        assertEquals("file:/tmp/camel-harness?fileName=hello.txt",
            resolve("write", Map.of("directoryName", "/tmp/camel-harness", "fileName", "hello.txt")));
    }

    @Test
    void appendUsesSameUriShape() {
        assertEquals("file:/tmp/camel-harness?fileName=hello.txt",
            resolve("append", Map.of("directoryName", "/tmp/camel-harness", "fileName", "hello.txt")));
    }

    @Test
    void missingDirectoryThrows() {
        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
            () -> resolve("read", Map.of()));
        assertTrue(ex.getMessage().contains("directoryName"));
    }
}
