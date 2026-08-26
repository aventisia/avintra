package camel.harness.connectors.ftp.transfer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;

import org.apache.camel.Exchange;
import org.apache.camel.impl.DefaultCamelContext;
import org.apache.camel.support.DefaultExchange;
import org.junit.jupiter.api.Test;

import camel.harness.connectors.ftp.FtpConfigurer;
import camel.harness.core.AuthConfiguration;
import camel.harness.core.ConnectorRequest;

/**
 * Focused tests for the FTP {@code transfer} service: read/write/append/delete/
 * list/check share one configurer; consumer-style operations add the expected
 * Camel URI options.
 */
class FtpTransferTest {

    private final FtpConfigurer configurer = new FtpConfigurer();

    private String resolve(String operation, Map<String, Object> config, AuthConfiguration auth) {
        Exchange exchange = new DefaultExchange(new DefaultCamelContext());
        ConnectorRequest request = new ConnectorRequest(null, null, "ftp", operation, config,
            auth, null, null, null, null);
        return configurer.resolveEndpoint(exchange, request, null);
    }

    private static AuthConfiguration basic() {
        return new AuthConfiguration("basic", "test", "test", null, null, null,
            null, null, null, null, null, null, null, null, null, null, null, null, null);
    }

    @Test
    void writeBuildsFtpUriWithCredentials() {
        String uri = resolve("write", Map.of("scheme", "ftp", "host", "localhost", "port", "21",
            "directoryName", "upload", "fileName", "data.txt"), basic());
        assertEquals("ftp://localhost:21/upload?username=test&password=test&fileName=data.txt", uri);
    }

    @Test
    void sftpSchemeIsPreserved() {
        String uri = resolve("read", Map.of("scheme", "sftp", "host", "localhost", "port", "2222",
            "directoryName", "upload", "fileName", "data.txt"), basic());
        assertEquals("sftp://localhost:2222/upload?username=test&password=test&fileName=data.txt&idempotent=false&maxMessagesPerPoll=1", uri);
    }

    @Test
    void listUsesNoopOption() {
        String uri = resolve("list", Map.of("scheme", "ftp", "host", "localhost", "port", "21",
            "directoryName", "."), basic());
        assertTrue(uri.contains("noop=true"));
    }

    @Test
    void deleteUsesDeleteOption() {
        String uri = resolve("delete", Map.of("scheme", "ftp", "host", "localhost", "port", "21",
            "directoryName", ".", "fileName", "data.txt"), basic());
        assertTrue(uri.contains("delete=true"));
    }

    @Test
    void missingHostThrows() {
        assertThrows(IllegalArgumentException.class, () -> resolve("read",
            Map.of("directoryName", "upload"), basic()));
    }
}
